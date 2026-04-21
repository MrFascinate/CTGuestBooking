'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import BookingModal from './BookingModal';

interface Slot {
  startUtc: string;
  endUtc: string;
  startLocal: string;
}

interface Props {
  rescheduleMode?: boolean;
  onSlotSelect?: (slot: Slot) => void;
}

const RECORDING_TZ = 'America/Chicago';

export default function BookingCalendar({ rescheduleMode, onSlotSelect }: Props = {}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const fetchSlots = useCallback(async (date: Date) => {
    setLoading(true);
    const monthKey = format(date, 'yyyy-MM');
    try {
      const res = await fetch(`/api/availability?month=${monthKey}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots(currentMonth);
  }, [currentMonth, fetchSlots]);

  // Group slots by local date string (CT)
  const slotsByDay: Record<string, Slot[]> = {};
  for (const slot of slots) {
    const localDate = format(toZonedTime(parseISO(slot.startUtc), RECORDING_TZ), 'yyyy-MM-dd');
    if (!slotsByDay[localDate]) slotsByDay[localDate] = [];
    slotsByDay[localDate].push(slot);
  }

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const daySlots = selectedDay
    ? slotsByDay[format(selectedDay, 'yyyy-MM-dd')] ?? []
    : [];

  const handleBookingSuccess = () => {
    setSelectedSlot(null);
    setSelectedDay(null);
    fetchSlots(currentMonth);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="p-2 rounded transition-colors"
          style={{ color: 'var(--ct-muted)' }}
          aria-label="Previous month"
        >
          ←
        </button>
        <h2
          className="text-lg font-semibold tracking-wide"
          style={{ fontFamily: 'Clash Display, sans-serif', color: 'var(--ct-text)' }}
        >
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="p-2 rounded transition-colors"
          style={{ color: 'var(--ct-muted)' }}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div
            key={d}
            className="text-center text-xs py-1 tracking-widest uppercase"
            style={{ color: 'var(--ct-muted)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, currentMonth);
          const hasSlots = !!slotsByDay[key]?.length;
          const isSelected = selectedDay && isSameDay(day, selectedDay);

          return (
            <button
              key={key}
              onClick={() => {
                if (!inMonth || !hasSlots) return;
                setSelectedDay(day);
                setSelectedSlot(null);
              }}
              disabled={!inMonth || !hasSlots}
              className="relative aspect-square flex items-center justify-center rounded text-sm transition-all"
              style={{
                color: !inMonth
                  ? 'var(--ct-border)'
                  : hasSlots
                  ? isSelected
                    ? 'var(--ct-bg)'
                    : 'var(--ct-text)'
                  : 'var(--ct-muted)',
                backgroundColor: isSelected
                  ? 'var(--ct-gold)'
                  : hasSlots && inMonth
                  ? 'var(--ct-card)'
                  : 'transparent',
                border: hasSlots && inMonth && !isSelected
                  ? '1px solid var(--ct-border-hover)'
                  : '1px solid transparent',
                cursor: hasSlots && inMonth ? 'pointer' : 'default',
                fontWeight: hasSlots && inMonth ? 500 : 400,
              }}
            >
              {format(day, 'd')}
              {hasSlots && inMonth && !isSelected && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--ct-gold)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="text-center text-sm mt-6" style={{ color: 'var(--ct-muted)' }}>
          Checking availability...
        </p>
      )}

      {/* Slot list */}
      {selectedDay && !loading && (
        <div className="mt-8">
          <h3
            className="text-sm uppercase tracking-widest mb-4"
            style={{ color: 'var(--ct-gold)', fontFamily: 'Clash Display, sans-serif' }}
          >
            {format(selectedDay, 'EEEE, MMMM d')}
          </h3>
          {daySlots.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--ct-muted)' }}>
              No slots available on this day.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {daySlots.map((slot) => (
                <button
                  key={slot.startUtc}
                  onClick={() => {
                    setSelectedSlot(slot);
                    onSlotSelect?.(slot);
                  }}
                  className="px-4 py-2 rounded text-sm font-medium transition-all"
                  style={{
                    backgroundColor: 'var(--ct-card)',
                    border: '1px solid var(--ct-border-hover)',
                    color: 'var(--ct-text)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--ct-gold)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--ct-bg)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--ct-card)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--ct-text)';
                  }}
                >
                  {slot.startLocal}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedSlot && !rescheduleMode && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
