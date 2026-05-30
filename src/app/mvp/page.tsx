import { MvpVotingCard } from '@/components/MvpVotingCard';
import { MvpLeaderboard } from '@/components/MvpLeaderboard';

export const metadata = { title: 'Al Carbone MVP · Cabin Cup 2026' };

export default function MvpPage() {
  return (
    <>
      <section className="text-center border-b border-border pb-6 mb-2">
        <h1 className="text-3xl font-black tracking-tight">Al Carbone MVP</h1>
        <p className="text-sm text-text-muted mt-1.5 font-medium">
          Player stats across every event · Updated live
        </p>
      </section>

      <MvpVotingCard />
      <MvpLeaderboard />
    </>
  );
}
