import { Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MediaStatsProps {
  totalMedia: number;
  activeMedia: number;
  inactiveMedia: number;
}

export function MediaStats({ 
  totalMedia, 
  activeMedia, 
  inactiveMedia
}: MediaStatsProps) {
  const stats = [
    {
      title: "Total des médias",
      value: totalMedia,
      icon: <Video className="h-4 w-4 text-blue-600" />,
    },
    {
      title: "Médias actifs",
      value: activeMedia,
      icon: <Video className="h-4 w-4 text-green-600" />,
    },
    {
      title: "Médias inactifs",
      value: inactiveMedia,
      icon: <Video className="h-4 w-4 text-red-600" />,
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 