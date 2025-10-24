// packages/ui/src/HackathonCard.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Define the shape of the props the card will accept
export interface HackathonCardProps {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  startDate: string;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  href: string; // The URL to navigate to on click
}

export function HackathonCard({ id, name, description, logoUrl, startDate, status, href }: HackathonCardProps) {
  const shortDescription = description.length > 100 ? `${description.substring(0, 100)}...` : description;

  const statusBadge = {
    UPCOMING: <Badge variant="secondary">Upcoming</Badge>,
    LIVE: <Badge className="bg-green-600 text-white">Live Now</Badge>,
    ENDED: <Badge variant="destructive">Ended</Badge>,
  }[status];

  return (
    <Link href={href} className="block hover:scale-105 transition-transform duration-200">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center gap-4">
          <Image src={logoUrl} alt={`${name} logo`} width={64} height={64} className="rounded-md" />
          <div>
            <CardTitle>{name}</CardTitle>
            <div className="mt-2">{statusBadge}</div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Starts: {new Date(startDate).toLocaleDateString()}
          </p>
          <p className="mt-2 text-sm">{shortDescription}</p>
        </CardContent>
      </Card>
    </Link>
  );
}