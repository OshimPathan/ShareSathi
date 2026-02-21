import { useState } from "react";
import { Gift, Copy, Check, Share2, Users, Crown, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../store/authStore";

const ReferralPage = () => {
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  // Generate referral code from user ID (stub — real implementation would be server-side)
  const referralCode = user?.id
    ? `SS-${user.id.slice(0, 4).toUpperCase()}${user.id.slice(-4).toUpperCase()}`
    : "SS-XXXXXXXX";
  const referralLink = `${window.location.origin}/login?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join ShareSathi — Free Paper Trading",
          text: `Practice stock trading on NEPSE with virtual money! Use my referral code: ${referralCode}`,
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  // Stub data
  const stats = {
    totalReferrals: 0,
    activeReferrals: 0,
    rewardsEarned: 0,
    pendingRewards: 0,
  };

  const rewards = [
    {
      icon: <Gift className="w-5 h-5" />,
      title: "Invite a Friend",
      description: "Share your unique referral link with friends",
      color: "mero-teal",
      bgColor: "bg-mero-teal/10",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Friend Signs Up",
      description: "They create an account and make their first trade",
      color: "blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: <Crown className="w-5 h-5" />,
      title: "Both Get Rewarded",
      description: "You both receive 1 month of Basic plan for free!",
      color: "amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="animate-slide-up">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mero-teal via-emerald-600 to-teal-700 p-6 md:p-8 text-white">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Referral Program</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Invite Friends, Get Free Premium
            </h1>
            <p className="text-sm text-white/80 mt-2 max-w-lg">
              Share ShareSathi with your friends. When they sign up and make their first paper trade,
              you both get 1 month of Basic plan absolutely free.
            </p>
          </div>
        </div>
      </header>

      {/* Referral Code Card */}
      <Card className="animate-slide-up delay-100" style={{ opacity: 0, animationFillMode: "forwards" } as React.CSSProperties}>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-700 truncate dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                {referralLink}
              </div>
              <button
                onClick={handleCopy}
                className={`shrink-0 p-3 rounded-xl border transition-all ${
                  copied
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                }`}
                title="Copy link"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Your code:</span>
              <code className="font-mono font-bold text-mero-teal bg-mero-teal/10 px-3 py-1 rounded-lg">
                {referralCode}
              </code>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleShare} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share with Friends
              </Button>
              <Button variant="secondary" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <div className="animate-slide-up delay-200" style={{ opacity: 0, animationFillMode: "forwards" } as React.CSSProperties}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rewards.map((step, i) => (
            <div key={i} className="relative">
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className={`w-10 h-10 rounded-xl ${step.bgColor} flex items-center justify-center mb-3 text-${step.color}`}>
                    {step.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-mero-teal">Step {i + 1}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{step.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{step.description}</p>
                </CardContent>
              </Card>
              {i < rewards.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up delay-300" style={{ opacity: 0, animationFillMode: "forwards" } as React.CSSProperties}>
        {[
          { label: "Total Referrals", value: stats.totalReferrals, icon: <Users className="w-4 h-4 text-blue-600" /> },
          { label: "Active Friends", value: stats.activeReferrals, icon: <Users className="w-4 h-4 text-emerald-600" /> },
          { label: "Months Earned", value: stats.rewardsEarned, icon: <Crown className="w-4 h-4 text-amber-600" /> },
          { label: "Pending", value: stats.pendingRewards, icon: <Gift className="w-4 h-4 text-purple-600" /> },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-2">
                {stat.icon}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referral History (empty state) */}
      <Card className="animate-slide-up delay-400" style={{ opacity: 0, animationFillMode: "forwards" } as React.CSSProperties}>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 dark:bg-slate-700">
              <Gift className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No referrals yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Share your link with friends to start earning free premium months!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralPage;
