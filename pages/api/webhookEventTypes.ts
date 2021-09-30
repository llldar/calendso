import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

import prisma from "@lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req: req });

  if (!session) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  // List webhook event types
  if (req.method === "POST") {
    const webhookEventTypes = await prisma.eventType.findFirst({
      where: {
        id: req.body.eventTypeId,
      },
    });

    return res.status(200).json({ webhookEventTypes: webhookEventTypes });
  }

  res.status(404).json({ message: "Webhook Event Types not found" });
}
