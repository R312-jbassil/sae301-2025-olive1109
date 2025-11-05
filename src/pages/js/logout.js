import pb from "../../utils/pb";

export const POST = async ({ cookies }) => {
  // Clear server-side auth store (best-effort)
  try {
    pb.authStore.clear();
  } catch (e) {
    // ignore if not available
  }

  // Delete the authentication cookie we set at login
  cookies.delete("pb_auth", { path: "/" });

  // Redirect to home
  return new Response(null, { status: 303, headers: { Location: "/" } });
};
