import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { formatDate } from "~/lib/date";
import { useState } from "react";
import { Link } from "react-router";

interface Session {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

interface RecentSessionsProps {
  sessions: Session[];
  userId: string;
}

export function RecentSessions({ sessions, userId }: RecentSessionsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 10;
  const totalPages = Math.ceil(sessions.length / sessionsPerPage);

  const startIndex = (currentPage - 1) * sessionsPerPage;
  const endIndex = startIndex + sessionsPerPage;
  const currentSessions = sessions.slice(startIndex, endIndex);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Sessions</CardTitle>
            <CardDescription>
              Showing {currentSessions.length} of {sessions.length} sessions
            </CardDescription>
          </div>
          <Button variant="destructive" size="sm" asChild>
            <Link to="revoke-all">Revoke All Sessions</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {currentSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{session.userAgent || "Unknown device"}</p>
                <p className="text-xs text-muted-foreground">{formatDate(session.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{session.ipAddress || "IP unknown"}</Badge>
                <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                  <Link to={`revoke/${session.id}`}>Revoke</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
