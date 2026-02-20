"use client";

interface FormattedDateProps {
  date: string;
  format?: "short" | "long";
}

/**
 * Client component that formats dates in the user's local timezone.
 * Prevents server/client timezone mismatch for Server Components.
 */
export function FormattedDate({ date, format = "short" }: FormattedDateProps) {
  const d = new Date(date);
  const formatted =
    format === "long"
      ? d.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

  return <time dateTime={date}>{formatted}</time>;
}

interface FormattedDateRangeProps {
  start: string;
  end: string;
}

export function FormattedDateRange({ start, end }: FormattedDateRangeProps) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const year = endDate.getFullYear();

  const formatted =
    startMonth === endMonth
      ? `${startMonth} ${startDay} - ${endDay}, ${year}`
      : `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;

  return <time dateTime={start}>{formatted}</time>;
}
