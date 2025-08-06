import { CheckCircle, XCircle, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MediaStatsProps {
  totalMedia: number;
  activeMedia: number;
  inactiveMedia: number;
}

export function MediaStats({ totalMedia, activeMedia, inactiveMedia }: MediaStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Video className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Total Médias</p>
              <p className="text-2xl font-bold">{totalMedia}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            <div>
              <p className="text-sm font-medium">Médias Actifs</p>
              <p className="text-2xl font-bold">{activeMedia}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalMedia > 0 ? Math.round((activeMedia / totalMedia) * 100) : 0}%
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 mr-2 text-red-500" />
            <div>
              <p className="text-sm font-medium">Médias Inactifs</p>
              <p className="text-2xl font-bold">{inactiveMedia}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalMedia > 0 ? Math.round((inactiveMedia / totalMedia) * 100) : 0}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 