import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, RefreshCw, X, AlertCircle } from 'lucide-react';
import { OpportunityCard } from '../components/OpportunityCard';

export function CataloguePage({
  initialCategory = 'All',
  initialSearch = '',
  opportunities,
  isLoading,
  error,
  onRefresh,
  onSelectOpportunity,
  savedMap,
  onToggleSave,
  onOpenReminder,
  onApplyNow,
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortOption, setSortOption] = useState('deadline_asc');

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialSearch]);

  const categories = [
    'All',
    'Scholarships',
    'Internships',
    'Competitive Examinations',
    'Jobs & Training'
  ];

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      opp.category.toLowerCase() === selectedCategory.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      opp.title.toLowerCase().includes(q) ||
      opp.organization.toLowerCase().includes(q) ||
      opp.shortDescription.toLowerCase().includes(q) ||
      (opp.tags && opp.tags.some((t) => t.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (sortOption === 'deadline_asc') {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (sortOption === 'deadline_desc') {
      return new Date(b.deadline) - new Date(a.deadline);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="space-y-6 pb-12 text-[#F7F5FC]">
      {/* Search and Filters Header */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-glass space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F7F5FC] font-display">
            Find Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-[#B7B0C7] mt-0.5">
            Explore scholarships, internships, exams, and jobs that may suit you.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#92899F]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, organization, or skill (e.g. Google, ISRO, Python, B.Tech)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl glass-input placeholder-[#92899F] text-xs sm:text-sm font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#92899F] hover:text-[#F7F5FC] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown & Refresh */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[rgba(14,12,21,0.60)] backdrop-blur-md border border-[rgba(255,255,255,0.12)] rounded-xl px-3 py-2 text-xs font-semibold text-[#B7B0C7]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#A78BFA]" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent focus:outline-none font-bold text-[#F7F5FC] cursor-pointer"
              >
                <option value="deadline_asc" className="bg-[#0D0B13] text-[#F7F5FC]">Deadline: Nearest First</option>
                <option value="deadline_desc" className="bg-[#0D0B13] text-[#F7F5FC]">Deadline: Furthest Out</option>
                <option value="newest" className="bg-[#0D0B13] text-[#F7F5FC]">Recently Added</option>
              </select>
            </div>

            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(14,12,21,0.60)] text-[#B7B0C7] hover:text-[#F7F5FC] hover:bg-[rgba(22,18,31,0.6)] transition-colors cursor-pointer"
              title="Refresh listings"
              aria-label="Refresh listings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm font-bold'
                  : 'glass-card border-[rgba(255,255,255,0.10)] text-[#B7B0C7] hover:text-[#F7F5FC] hover:bg-[rgba(22,18,31,0.6)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalogue Meta Bar */}
      <div className="flex items-center justify-between text-xs text-[#B7B0C7] px-1 font-medium">
        <div>
          Showing <span className="font-bold text-[#F7F5FC]">{sortedOpportunities.length}</span> of {opportunities.length} opportunities
          {selectedCategory !== 'All' && <span> in <strong className="text-[#C4B5FD]">{selectedCategory}</strong></span>}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#8F879F]">
          <span>Verified Demonstration Listings</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#B7B0C7] font-medium">Loading opportunities...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-[#FB7185]/15 border border-[#FB7185]/35 rounded-2xl text-xs text-[#FB7185] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#FB7185] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedOpportunities.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto space-y-3 shadow-glass">
          <div className="w-12 h-12 rounded-2xl bg-[rgba(18,16,25,0.7)] text-[#A78BFA] flex items-center justify-center mx-auto text-xl border border-[rgba(196,181,253,0.16)]">
            🔍
          </div>
          <h2 className="text-sm font-bold text-[#F7F5FC] font-display">No opportunities found</h2>
          <p className="text-xs text-[#B7B0C7]">
            Try different keywords or select "All" to view all available opportunities.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedOpportunities.map((opp) => (
          <OpportunityCard
            key={opp._id}
            opportunity={opp}
            onSelect={onSelectOpportunity}
            isSaved={!!savedMap[opp._id]}
            savedStatus={savedMap[opp._id]?.status}
            onToggleSave={onToggleSave}
            onSetReminder={onOpenReminder}
            onApplyNow={onApplyNow}
          />
        ))}
      </div>
    </div>
  );
}
