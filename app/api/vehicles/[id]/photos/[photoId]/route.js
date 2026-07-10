import { NextResponse } from 'next/server';
import { getSessionUser, unauthorized } from '@/lib/session';
import { withAudit, logChange } from '@/lib/audit';

export async function DELETE(request, { params }) {
  const { id, photoId } = await params;
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    await withAudit(async client => {
      const { rowCount } = await client.query(
        `DELETE FROM vehicle_photos WHERE id = $1 AND vehicle_id = $2`,
        [photoId, id],
      );
      // Nothing deleted means nothing happened — don't log a phantom change.
      if (rowCount === 0) return;

      await logChange(client, {
        entityType: 'photo', entityId: Number(photoId), vehicleId: Number(id),
        user, action: 'deleted',
      });
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/vehicles/[id]/photos/[photoId] failed:', err);
    return NextResponse.json(
      { error: 'Could not delete the photo. Please try again.' },
      { status: 500 },
    );
  }
}
