import { connectDB } from "@/lib/mongodb";
import Template from "@/models/Template";

/* GET template by ID */
export async function GET(req, context) {
  try {
    const { id } = await context.params; // ✅ FIX

    await connectDB();

    const template = await Template.findById(id);

    if (!template) {
      return new Response(
        JSON.stringify({ error: "Template not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(template), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch template" }),
      { status: 500 }
    );
  }
}

/* UPDATE template */
export async function PUT(req, context) {
  try {
    const { id } = await context.params; // ✅ FIX
    const data = await req.json();

    await connectDB();

    const template = await Template.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return new Response(JSON.stringify(template), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Update failed" }),
      { status: 500 }
    );
  }
}

/* DELETE template */
export async function DELETE(req, context) {
  try {
    const { id } = await context.params; // ✅ FIX

    await connectDB();
    await Template.findByIdAndDelete(id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Delete failed" }),
      { status: 500 }
    );
  }
}
