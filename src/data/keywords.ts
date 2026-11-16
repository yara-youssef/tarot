// Keywords and page numbers extracted from "The Ultimate Guide to Tarot Card Meanings" (B. Esselmont).
// page = printed page number in the guide where the card's chapter starts.
export const guideKeywords: Record<string, { page: number; upright: string[]; reversed: string[] }> = {
  'major-00': {"page": 11, "upright": ["Beginnings", "Innocence", "Spontaneity", "A free spirit"], "reversed": ["Holding back", "Recklessness", "Risk-taking"]},  // 0. THE FOOL
  'major-01': {"page": 16, "upright": ["Manifestation", "Resourcefulness", "Power", "Inspired action"], "reversed": ["Manipulation", "Poor planning", "Untapped talents"]},  // I. THE MAGICIAN
  'major-02': {"page": 21, "upright": ["Intuition", "Sacred knowledge", "Divine feminine", "The subconscious mind"], "reversed": ["Secrets", "Disconnected withdrawal and silence"]},  // II. THE HIGH PRIESTESS
  'major-03': {"page": 26, "upright": ["Fertility", "Femininity", "Beauty", "Nature", "Abundance"], "reversed": ["Creative block", "Dependence on others"]},  // III. THE EMPRESS
  'major-04': {"page": 31, "upright": ["Authority", "Establishment", "Structure", "A father figure"], "reversed": ["Domination", "Discipline", "Inflexibility"]},  // IV. THE EMPEROR
  'major-05': {"page": 36, "upright": ["Spiritual wisdom", "Religious beliefs", "Conformity", "Tradition", "Institutions"], "reversed": ["Personal beliefs", "Freedom", "Challenging the status quo"]},  // V. THE HIEROPHANT
  'major-06': {"page": 41, "upright": ["Love", "Harmony", "Relationships", "Values alignment", "Choices"], "reversed": ["Self-love", "Disharmony", "Imbalance", "Misalignment of values"]},  // VI. THE LOVERS
  'major-07': {"page": 47, "upright": ["Control", "Willpower", "Success", "Action", "Determination"], "reversed": ["Self-discipline", "Opposition", "Lack of direction"]},  // VII. THE CHARIOT
  'major-08': {"page": 52, "upright": ["Strength", "Compassion", "Courage", "Persuasion", "Influence"], "reversed": ["Inner strength", "Self-doubt", "Low energy", "Raw emotion"]},  // VIII. STRENGTH
  'major-09': {"page": 57, "upright": ["Soul-searching", "Introspection", "Being alone", "Inner guidance"], "reversed": ["Isolation", "Loneliness", "Withdrawal"]},  // IX. THE HERMIT
  'major-10': {"page": 62, "upright": ["Good luck", "Karma", "Life cycles", "Destiny", "A turning point"], "reversed": ["Bad luck", "Resistance to change", "Breaking cycles"]},  // X. WHEEL OF FORTUNE
  'major-11': {"page": 67, "upright": ["Justice", "Fairness", "Truth", "Cause and effect", "Law"], "reversed": ["Unfairness", "Lack of accountability", "Dishonesty"]},  // XI. JUSTICE
  'major-12': {"page": 72, "upright": ["Pause", "Surrender", "Letting go", "New perspectives"], "reversed": ["Delays", "Resistance", "Stalling", "Indecision"]},  // XII. THE HANGED MAN
  'major-13': {"page": 77, "upright": ["Endings", "Change", "Transformation", "Transition"], "reversed": ["Resistance to change", "Personal transformation", "Inner purging"]},  // XIII. DEATH
  'major-14': {"page": 82, "upright": ["Balance", "Moderation", "Patience", "Purpose"], "reversed": ["Imbalance", "Excess", "Self-healing", "Re-alignment"]},  // XIV. TEMPERANCE
  'major-15': {"page": 88, "upright": ["Shadow self", "Attachment", "Addiction", "Restriction", "Sexuality"], "reversed": ["Releasing limiting beliefs", "Exploring dark thoughts", "Detachment"]},  // XV. THE DEVIL
  'major-16': {"page": 94, "upright": ["Sudden change", "Upheaval", "Chaos", "Revelation", "Awakening"], "reversed": ["Personal transformation", "Fear of change", "Averting disaster"]},  // XVI. THE TOWER
  'major-17': {"page": 100, "upright": ["Hope", "Faith", "Purpose", "Renewal", "Spirituality"], "reversed": ["Lack of faith", "Despair", "Self-trust", "Disconnection"]},  // XVII. THE STAR
  'major-18': {"page": 105, "upright": ["Illusion", "Fear", "Anxiety", "Subconscious", "Intuition"], "reversed": ["Release of fear", "Repressed emotion", "Inner confusion"]},  // XVIII. THE MOON
  'major-19': {"page": 110, "upright": ["Positivity", "Fun", "Warmth", "Success", "Vitality"], "reversed": ["Inner child", "Feeling down", "Overly optimistic"]},  // XIX. THE SUN
  'major-20': {"page": 115, "upright": ["Judgement", "Rebirth", "Inner calling", "Absolution"], "reversed": ["Self-doubt", "Inner critic", "Ignoring the call"]},  // XX. JUDGEMENT
  'major-21': {"page": 120, "upright": ["Completion", "Integration", "Accomplishment", "Travel"], "reversed": ["Seeking personal closure", "Short-cuts", "Delays"]},  // XXI. WORLD
  'cups-01': {"page": 129, "upright": ["Love", "New relationships", "Compassion", "Creativity"], "reversed": ["Self-love", "Intuition", "Repressed emotions"]},  // ACE OF CUPS
  'cups-02': {"page": 134, "upright": ["Unified love", "Partnership", "Mutual attraction"], "reversed": ["Self-love", "Break-ups", "Disharmony", "Distrust"]},  // TWO OF CUPS
  'cups-03': {"page": 139, "upright": ["Celebration", "Friendship", "Creativity", "Collaborations"], "reversed": ["Independence", "Alone time", "Hardcore partying", "'three's a crowd'"]},  // THREE OF CUPS
  'cups-04': {"page": 145, "upright": ["Meditation", "Contemplation", "Apathy", "Re-evaluation"], "reversed": ["Retreat", "Withdrawal", "Checking in for alignment"]},  // FOUR OF CUPS
  'cups-05': {"page": 150, "upright": ["Regret", "Failure", "Disappointment", "Pessimism"], "reversed": ["Personal setbacks", "Self-forgiveness", "Moving on"]},  // FIVE OF CUPS
  'cups-06': {"page": 155, "upright": ["Revisiting the past", "Childhood memories", "Innocence", "Joy"], "reversed": ["Living in the past", "Forgiveness", "Lacking playfulness"]},  // SIX OF CUPS
  'cups-07': {"page": 160, "upright": ["Opportunities", "Choices", "Wishful thinking", "Illusion"], "reversed": ["Alignment", "Personal values", "Overwhelmed by choices"]},  // SEVEN OF CUPS
  'cups-08': {"page": 165, "upright": ["Disappointment", "Abandonment", "Withdrawal", "Escapism"], "reversed": ["Trying one more time", "Indecision", "Aimless drifting", "Walking away"]},  // EIGHT OF CUPS
  'cups-09': {"page": 170, "upright": ["Contentment", "Satisfaction", "Gratitude", "Wish come true"], "reversed": ["Inner happiness", "Materialism", "Dissatisfaction", "Indulgence"]},  // NINE OF CUPS
  'cups-10': {"page": 175, "upright": ["Divine love", "Blissful relationships", "Harmony", "Alignment"], "reversed": ["Disconnection", "Misaligned values", "Struggling relationships"]},  // TEN OF CUPS
  'cups-11': {"page": 181, "upright": ["Creative opportunities", "Intuitive messages", "Curiosity", "Possibility"], "reversed": ["New ideas", "Doubting intuition", "Creative blocks", "Emotional immaturity"]},  // PAGE OF CUPS
  'cups-12': {"page": 186, "upright": ["Creativity", "Romance", "Charm", "Imagination", "Beauty"], "reversed": ["Overactive imagination", "Unrealistic", "Jealous", "Moody"]},  // KNIGHT OF CUPS
  'cups-13': {"page": 191, "upright": ["Compassionate", "Caring", "Emotionally stable", "Intuitive", "In flow"], "reversed": ["Inner dependency"]},  // QUEEN OF CUPS
  'cups-14': {"page": 197, "upright": ["Emotionally diplomatic", "Balanced", "Compassionate"], "reversed": ["Self-compassion", "Inner feelings", "Moodiness", "Emotionally manipulative"]},  // KING OF CUPS
  'pentacles-01': {"page": 204, "upright": ["A new financial manifestation", "Abundance", "Career opportunity"], "reversed": ["Lost opportunity", "Lack of planning and foresight"]},  // ACE OF PENTACLES
  'pentacles-02': {"page": 209, "upright": ["Multiple priorities", "Prioritisation", "Adaptability", "Time management"], "reversed": ["Over-committed", "Disorganisation", "Reprioritisation"]},  // TWO OF PENTACLES
  'pentacles-03': {"page": 214, "upright": ["Teamwork", "Collaboration", "Learning", "Implementation"], "reversed": ["Disharmony", "Misalignment", "Working alone"]},  // THREE OF PENTACLES
  'pentacles-04': {"page": 219, "upright": ["Saving money", "Security", "Conservatism", "Scarcity", "Control"], "reversed": ["Over-spending", "Greed", "Self-protection"]},  // FOUR OF PENTACLES
  'pentacles-05': {"page": 225, "upright": ["Financial loss", "Poverty", "Lack mindset", "Isolation", "Worry"], "reversed": ["Recovery from financial loss", "Spiritual poverty"]},  // FIVE OF PENTACLES
  'pentacles-06': {"page": 230, "upright": ["Giving", "Receiving", "Sharing wealth", "Generosity", "Charity"], "reversed": ["Self-care", "Unpaid debts", "One-sided charity"]},  // SIX OF PENTACLES
  'pentacles-07': {"page": 235, "upright": ["Long-term view", "Sustainable results", "Perseverance", "Investment"], "reversed": ["Lack of long-term vision", "Limited success or reward"]},  // SEVEN OF PENTACLES
  'pentacles-08': {"page": 240, "upright": ["Apprenticeship", "Repetitive tasks", "Mastery", "Skill development"], "reversed": ["Self-development", "Perfectionism", "Misdirected activity"]},  // EIGHT OF PENTACLES
  'pentacles-09': {"page": 245, "upright": ["Abundance", "Luxury", "Self-sufficiency", "Financial independence"], "reversed": ["Self-worth", "Over-investment in work", "Hustling"]},  // NINE OF PENTACLES
  'pentacles-10': {"page": 250, "upright": ["Wealth", "Financial security", "Family", "Long-term success", "Contribution"], "reversed": ["The dark side of wealth", "Financial failure or loss"]},  // TEN OF PENTACLES
  'pentacles-11': {"page": 255, "upright": ["Manifestation", "Development", "Financial opportunity", "Skill"], "reversed": ["Lack of progress", "Procrastination", "Learn from failure"]},  // PAGE OF PENTACLES
  'pentacles-12': {"page": 260, "upright": ["Hard work", "Productivity", "Routine", "Conservatism"], "reversed": ["Self-discipline", "Perfectionism"]},  // KNIGHT OF PENTACLES
  'pentacles-13': {"page": 265, "upright": ["Nurturing", "Practical", "Providing financially", "A working parent"], "reversed": ["Financial independence", "Self-care", "Work-home conflict"]},  // QUEEN OF PENTACLES
  'pentacles-14': {"page": 270, "upright": ["Wealth", "Business", "Leadership", "Security", "Discipline", "Abundance"], "reversed": ["Financially inept", "Obsessed with wealth and status", "Stubborn"]},  // KING OF PENTACLES
  'swords-01': {"page": 277, "upright": ["Breakthroughs", "New ideas", "Mental clarity", "Success"], "reversed": ["Inner clarity", "Re-thinking an idea", "Clouded judgement"]},  // ACE OF SWORDS
  'swords-02': {"page": 282, "upright": ["Difficult decisions", "Weighing up options", "An impasse", "Avoidance"], "reversed": ["Indecision", "Confusion", "Information overload", "Stalemate"]},  // TWO OF SWORDS
  'swords-03': {"page": 287, "upright": ["Heartbreak", "Emotional pain", "Sorrow", "Grief", "Hurt"], "reversed": ["Negative self-talk", "Releasing pain", "Optimism", "Forgiveness"]},  // THREE OF SWORDS
  'swords-04': {"page": 293, "upright": ["Rest", "Relaxation", "Meditation", "Contemplation", "Recuperation"], "reversed": ["Exhaustion", "Burn-out", "Deep contemplation", "Stagnation"]},  // FOUR OF SWORDS
  'swords-05': {"page": 298, "upright": ["Conflict", "Disagreements", "Competition", "Defeat", "Winning at all costs"], "reversed": ["Reconciliation", "Resentment"]},  // FIVE OF SWORDS
  'swords-06': {"page": 303, "upright": ["Transition", "Change", "Rite of passage", "Releasing baggage"], "reversed": ["Personal transition", "Resistance to change", "Unfinished business"]},  // SIX OF SWORDS
  'swords-07': {"page": 308, "upright": ["Betrayal", "Deception", "Getting away with something", "Acting strategically"], "reversed": ["Imposter syndrome", "Self-deceit", "Keeping secrets"]},  // SEVEN OF SWORDS
  'swords-08': {"page": 313, "upright": ["Negative thoughts", "Self-imposed restriction", "Imprisonment", "Victim mentality"], "reversed": ["Self-limiting beliefs", "Inner critic", "Releasing negative thoughts", "Open to new perspectives"]},  // EIGHT OF SWORDS
  'swords-09': {"page": 318, "upright": ["Anxiety", "Worry", "Fear", "Depression", "Nightmares"], "reversed": ["Inner turmoil", "Deep-seated fears", "Secrets", "Releasing worry"]},  // NINE OF SWORDS
  'swords-10': {"page": 323, "upright": ["Painful endings", "Deep wounds", "Betrayal", "Loss", "Crisis"], "reversed": ["Recovery", "Regeneration", "Resisting an inevitable end"]},  // TEN OF SWORDS
  'swords-11': {"page": 328, "upright": ["New ideas", "Curiosity", "Thirst for knowledge", "New ways of communicating"], "reversed": ["Self-expression", "All talk and no action", "Haphazard action", "Haste"]},  // PAGE OF SWORDS
  'swords-12': {"page": 333, "upright": ["Ambitious", "Action-oriented", "Driven to succeed", "Fast-thinking"], "reversed": ["Restless", "Unfocused", "Impulsive", "Burn-out"]},  // KNIGHT OF SWORDS
  'swords-13': {"page": 338, "upright": ["Independent", "Unbiased boundaries", "Direct communication", "Judgement", "Clear"], "reversed": ["Overly-emotional", "Easily influenced", "Bitchy", "Cold-hearted"]},  // QUEEN OF SWORDS
  'swords-14': {"page": 343, "upright": ["Mental clarity", "Intellectual power", "Authority", "Truth"], "reversed": ["Quiet power", "Inner truth", "Misuse of power", "Manipulation"]},  // KING OF SWORDS
  'wands-01': {"page": 350, "upright": ["Inspiration", "New opportunities", "Growth", "Potential"], "reversed": ["An emerging idea", "Lack of direction", "Distractions", "Delays"]},  // ACE OF WANDS
  'wands-02': {"page": 355, "upright": ["Future planning", "Progress", "Decisions", "Discovery"], "reversed": ["Personal goals", "Inner alignment", "Fear of unknown", "Lack of planning"]},  // TWO OF WANDS
  'wands-03': {"page": 360, "upright": ["Progress", "Opportunities", "Expansion", "Foresight", "Overseas"], "reversed": ["Playing small", "Lack of foresight", "Unexpected delays"]},  // THREE OF WANDS
  'wands-04': {"page": 365, "upright": ["Celebration", "Homecoming", "Joy", "Harmony", "Relaxation"], "reversed": ["Personal celebration", "Inner harmony", "Conflict with others", "Transition"]},  // FOUR OF WANDS
  'wands-05': {"page": 370, "upright": ["Conflict", "Disagreements", "Competition", "Tension", "Diversity"], "reversed": ["Inner conflict", "Conflict avoidance", "Tension release"]},  // FIVE OF WANDS
  'wands-06': {"page": 375, "upright": ["Success", "Public recognition", "Progress", "Self-confidence"], "reversed": ["Private achievement", "Personal definition of success", "Fall from grace", "Egotism"]},  // SIX OF WANDS
  'wands-07': {"page": 380, "upright": ["Challenge", "Competition", "Protection", "Perseverance"], "reversed": ["Exhaustion", "Giving up", "Overwhelmed"]},  // SEVEN OF WANDS
  'wands-08': {"page": 385, "upright": ["Movement", "Fast paced change", "Action", "Alignment", "Air travel"], "reversed": ["Delays", "Frustration", "Resisting change", "Internal alignment"]},  // EIGHT OF WANDS
  'wands-09': {"page": 390, "upright": ["Resilience", "Courage", "Persistence", "Test of faith", "Boundaries"], "reversed": ["Inner resources", "Struggle", "Overwhelm", "Defensive", "Paranoia"]},  // NINE OF WANDS
  'wands-10': {"page": 395, "upright": ["Burden", "Completion", "Extra responsibility", "Hard work"], "reversed": ["Doing it all", "Carrying the burden", "Delegation", "Release"]},  // TEN OF WANDS
  'wands-11': {"page": 400, "upright": ["Inspiration", "Ideas", "Discovery", "Limitless potential", "Free spirit"], "reversed": ["Newly-formed ideas", "Redirecting energy", "Self-limiting beliefs", "A spiritual path"]},  // PAGE OF WANDS
  'wands-12': {"page": 405, "upright": ["Energy", "Passion", "Inspired action", "Adventure", "Impulsiveness"], "reversed": ["Passion project", "Haste", "Scattered energy", "Delays", "Frustration"]},  // KNIGHT OF WANDS
  'wands-13': {"page": 411, "upright": ["Courage", "Confidence", "Independence", "Social butterfly", "Determination"], "reversed": ["Self-respect", "Self-confidence", "Introverted", "Re-establish sense of self"]},  // QUEEN OF WANDS
  'wands-14': {"page": 416, "upright": ["Natural-born leader", "Grand visions", "Long-term success"], "reversed": ["Poor leadership", "Aggressive expectations", "Personal direction"]},  // KING OF WANDS
}
