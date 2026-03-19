import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  try {
    const { id } = event.queryStringParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        body: "Image ID required",
      };
    }

    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("file_path", id)
      .single();

    if (error || !data) {
      return {
        statusCode: 404,
        body: "Image not found",
      };
    }

    const dataUrl = data.public_url;
    const base64Match = dataUrl.match(/;base64,(.+)$/);

    if (!base64Match) {
      return {
        statusCode: 400,
        body: "Invalid image data",
      };
    }

    const base64Data = base64Match[1];
    const mimeType = data.mime_type || "image/jpeg";

    const buffer = Buffer.from(base64Data, "base64");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
      },
      body: buffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Server error: " + err.message,
    };
  }
};
