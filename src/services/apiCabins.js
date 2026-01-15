import supabase, { supabaseUrl } from "./supabase";

export async function getCabins() {
  const { data, error } = await supabase.from("cabins").select("*");

  if (error) {
    throw new Error("Cabins could not be loaded");
  }

  return data;
}

export async function createEditCabin(newCabin, id) {
  const hasImagePath = newCabin.image?.startsWith?.(supabaseUrl);

  let imagePath = null;

  if (!hasImagePath && newCabin.image) {
    const imageName = `${Math.random()}-${newCabin.image.name}`.replaceAll(
      "/",
      ""
    );
    imagePath = `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`;

    // Upload the image to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("cabin-images")
      .upload(imageName, newCabin.image);

    if (uploadError) {
      throw new Error("Image upload failed");
    }
  } else {
    imagePath = newCabin.image;
  }

  // 1. Create/edit cabin
  let query = supabase.from("cabins");

  // A) CREATE
  if (!id) {
    query = query.insert([{ ...newCabin, image: imagePath }]);
  }

  // B) EDIT
  if (id) {
    query = query.update({ ...newCabin, image: imagePath }).eq("id", id);
  }

  const { data, error } = await query.select();

  if (error) {
    throw new Error("Cabin could not be created/edited");
  }

  if (hasImagePath) {
    return data;
  }
}

export async function deleteCabin(id) {
  const { data, error } = await supabase.from("cabins").delete().eq("id", id);

  if (error) {
    throw new Error("Cabin could not be deleted");
  }

  return data;
}
