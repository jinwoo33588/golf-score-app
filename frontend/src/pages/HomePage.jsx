import React from 'react';
import RecentRounds from '../components/home/RecentRounds';
import StatsSummary from '../components/home/StatsSummary';
import TrendChart from '../components/home/TrendChart';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home">
      <header className="home__header">
        <h1>대시보드</h1>
        <p className="home__subtitle">최근 라운드 요약과 통계를 한 눈에</p>
      </header>

      <section className="home__section">
        <h2 className="home__sectionTitle">통계 요약</h2>
        <StatsSummary />
      </section>


      <section className="home__section">
              <h2 className="home__sectionTitle">최근 라운드 (5개)</h2>
              <RecentRounds limit={5} />
      </section>

      
      <section className="home__section">
        <h2 className="home__sectionTitle">최근 트렌드</h2>
        <TrendChart />
      </section>
    </div>
  );
}
