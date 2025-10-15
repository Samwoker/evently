import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from 'next/server'
import { createUser,deleteUser ,updateUser} from '@/lib/actions/user.actions'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error("Missing CLERK_WEBHOOK_SECRET");

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature)
    return new NextResponse("Missing Svix headers", { status: 400 });

  const wh = new Webhook(WEBHOOK_SECRET);
  const body = await req.text();
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })as WebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }
    // Do something with payload
    // For this guide, log payload to console

    const eventType = evt.type

    if(eventType ==='user.created'){
        const {id, email_addresses,image_url,first_name,last_name,username} = evt.data

        const user = {
            clerkId:id,
            email:email_addresses[0].email_address,
            username:username!,
            firstName:first_name!,
            lastName:last_name!,
            photo:image_url
        }

        const newUser = await createUser(user)
    if (newUser) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id,
        },
      });
    }
        return NextResponse.json({message:"OK",user:newUser})

    }

    if(eventType === 'user.updated'){
         const {id,image_url,first_name,last_name,username} = evt.data

        const user = {
            clerkId:id,
            username:username!,
            firstName:first_name!,
            lastName:last_name!,
            photo:image_url
        }
        const updatedUser = await updateUser(id,user)
        return NextResponse.json({message:"OK",user:updatedUser})
    }

    if (eventType === 'user.deleted'){
        const {id} = evt.data
        const deletedUser = await deleteUser(id!)

        return NextResponse.json({message:"OK",user:deletedUser})
    }


    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}