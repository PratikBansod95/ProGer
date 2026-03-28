import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

export function ProjectCard({
  id,
  name,
  description,
  memberCount,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`}>
      <Card className="h-full transition hover:-translate-y-1 hover:shadow-lg">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Badge variant="outline">{memberCount} members</Badge>
          <span className="text-xs text-muted-foreground">Open project</span>
        </CardContent>
      </Card>
    </Link>
  );
}
