import { PAGE_SIZE } from "../utils/constants";
import { getToday } from "../utils/helpers";
import supabase from "./supabase";

export async function getBookings({ filter, sortBy, page }) {
  let baseFields = [
    "id",
    "created_at",
    "startDate",
    "endDate",
    "numNights",
    "numGuests",
    "status",
    "totalPrice",
    "cabins(name)",
    "guests(fullName, email)",
  ];

  // Map user-friendly sort labels to database fields
  const sortFieldMapping = {
    "Sort by amount (high first)": "totalPrice",
    "Sort by amount (low first)": "totalPrice",
    "Sort by date": "created_at",
    "Sort by date (earlier first)": "created_at",
    "Sort by date (recent first)": "created_at",
    // Add more mappings as needed
  };

  // Ensure sortBy.field is valid
  if (sortBy) {
    sortBy.field = sortFieldMapping[sortBy.field] || sortBy.field;
    if (!baseFields.includes(sortBy.field)) {
      console.warn(`Invalid sort field: ${sortBy.field}`);
      throw new Error(`Invalid sort field: ${sortBy.field}`);
    }

    // Set default direction if undefined
    sortBy.direction = sortBy.direction || "asc";
  }

  let query = supabase
    .from("bookings")
    .select(baseFields.join(", "), { count: "exact" });

  // Filter
  if (filter) {
    query = query[filter.method || "eq"](filter.field, filter.value);
  }

  // Sort
  if (sortBy) {
    query = query.order(sortBy.field, {
      ascending: sortBy.direction === "asc",
    });

    if (page) {
      const from = (page - 1) * (PAGE_SIZE - 1);
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Bookings could not be loaded");
  }

  return { data, count };
}

export async function getBooking(id) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, cabins(*), guests(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking not found");
  }

  return data;
}

// Returns all BOOKINGS that are were created after the given date. Useful to get bookings created in the last 30 days, for example.
export async function getBookingsAfterDate(date) {
  const { data, error } = await supabase
    .from("bookings")
    .select("created_at, totalPrice, extrasPrice")
    .gte("created_at", date)
    .lte("created_at", getToday({ end: true }));

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Returns all STAYS that are were created after the given date
export async function getStaysAfterDate(date) {
  const { data, error } = await supabase
    .from("bookings")
    // .select('*')
    .select("*, guests(fullName)")
    .gte("startDate", date)
    .lte("startDate", getToday());

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Activity means that there is a check in or a check out today
export async function getStaysTodayActivity() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, guests(fullName, nationality, countryFlag)")
    .or(
      `and(status.eq.unconfirmed,startDate.eq.${getToday()}),and(status.eq.checked-in,endDate.eq.${getToday()})`,
    )
    .order("created_at");

  // Equivalent to this. But by querying this, we only download the data we actually need, otherwise we would need ALL bookings ever created
  // (stay.status === 'unconfirmed' && isToday(new Date(stay.startDate))) ||
  // (stay.status === 'checked-in' && isToday(new Date(stay.endDate)))

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }
  return data;
}

export async function updateBooking(id, obj) {
  const { data, error } = await supabase
    .from("bookings")
    .update(obj)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  return data;
}

export async function deleteBooking(id) {
  // REMEMBER RLS POLICIES
  const { data, error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }
  return data;
}
