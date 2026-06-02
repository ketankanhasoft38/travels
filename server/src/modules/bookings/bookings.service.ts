import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../integrations/supabase/supabase.service';
import { ToursService } from '../tours/tours.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  private getPagination(pageRaw?: string, limitRaw?: string) {
    const page = Math.max(1, Number(pageRaw ?? 1) || 1);
    const limit = Math.min(50, Math.max(1, Number(limitRaw ?? 10) || 10));
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    return { page, limit, from, to };
  }

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly toursService: ToursService,
  ) {}

  async createPublicBooking(slug: string, payload: CreateBookingDto) {
    const tour = await this.toursService.getTourBySlug(slug);
    if (payload.guestCount > tour.guest_limit) {
      throw new BadRequestException('Guest count exceeds tour guest limit');
    }

    const supabase = this.supabaseService.getClient();
    const totalPriceCents = payload.guestCount * tour.price_cents;

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        tour_id: tour.id,
        visitor_name: payload.visitorName,
        visitor_email: payload.visitorEmail,
        guest_count: payload.guestCount,
        special_requests: payload.specialRequests ?? null,
        total_price_cents: totalPriceCents,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async listCreatorBookings(
    userId: string,
    pageRaw?: string,
    limitRaw?: string,
    search?: string,
    status?: string,
  ) {
    const supabase = this.supabaseService.getClient();
    const pagination = this.getPagination(pageRaw, limitRaw);
    let query = supabase
      .from('bookings')
      .select('*, tours!inner(title, creator_id, share_slug)', { count: 'exact' })
      .eq('tours.creator_id', userId)
      .range(pagination.from, pagination.to)
      .order('created_at', { ascending: false });

    if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(
        `visitor_name.ilike.%${search}%,visitor_email.ilike.%${search}%,tours.title.ilike.%${search}%`,
      );
    }

    const { data, error, count } = await query;

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pagination.limit));
    return {
      data: data ?? [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    };
  }

  async updateBookingStatus(userId: string, bookingId: string, status: 'confirmed' | 'cancelled') {
    const supabase = this.supabaseService.getClient();
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, tour_id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new NotFoundException('Booking not found');
    }

    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('id')
      .eq('id', booking.tour_id)
      .eq('creator_id', userId)
      .single();

    if (tourError || !tour) {
      throw new NotFoundException('Booking not found for this creator');
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select('*, tours!inner(title, creator_id, share_slug)')
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
