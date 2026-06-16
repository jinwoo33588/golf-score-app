import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ChevronRight } from 'lucide-react';
import { useGolfClubs } from '@/hooks/useGolfClubs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GolfClub } from '@/types';

function GolfClubCard({ club }: { club: GolfClub }) {
  const totalPar = club.nineCourses.reduce((s, c) => s + c.parTotal, 0);
  const totalHoles = club.nineCourses.reduce((s, c) => s + c.holeCount, 0);
  const courseNames = club.nineCourses
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c) => c.name)
    .join(' · ');

  return (
    <Link to={`/courses/${club._id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <p className="font-semibold text-base truncate">{club.name}</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                {club.region && (
                  <>
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span>{club.region}</span>
                    <span>·</span>
                  </>
                )}
                <span>{totalHoles}홀</span>
                <span>·</span>
                <span>Par {totalPar}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{courseNames}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 간단한 디바운스
  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as unknown as { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer);
    (window as unknown as { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer = setTimeout(() => setDebouncedSearch(v), 300);
  };

  const { data, isLoading } = useGolfClubs({ q: debouncedSearch || undefined, limit: 50 });
  const clubs = data?.clubs ?? [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">골프장</h1>
        <p className="text-sm text-muted-foreground mt-1">총 {data?.total ?? 0}개의 골프장</p>
      </div>

      {/* 검색 */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="골프장 이름으로 검색..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : clubs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {search ? `"${search}" 검색 결과가 없습니다` : '등록된 골프장이 없습니다'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clubs.map((club) => <GolfClubCard key={club._id} club={club} />)}
        </div>
      )}
    </div>
  );
}
