"use client";

import { useState, useRef } from "react";
import { Search, Globe, Shield, Zap, BarChart3, TrendingUp, CheckCircle2, XCircle, ChevronLeft, LayoutDashboard, Share2, Download, Bot, BrainCircuit, MessageSquareText, FileJson, Info, ExternalLink, Plus, Trash2, Calendar, Users, MousePointer2, Key, FileSpreadsheet, Fingerprint, Award, Mic, HeartPulse, UserCheck, AlertTriangle, Lightbulb, Target, Sparkles, MapPin, History, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as RechartsTooltip
} from 'recharts';
import { analyzeSEO, SEOResult, EntityInsight } from "@/lib/seo-analyzer";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Home() {
  const [url, setUrl] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([""]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SEOResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [history, setHistory] = useState<{url: string, score: number, date: string}[]>([
    { url: "example.com", score: 85, date: "18/03/2026" },
    { url: "my-shop.vn", score: 72, date: "17/03/2026" }
  ]);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleAddCompetitor = () => {
    if (competitors.length < 3) {
      setCompetitors([...competitors, ""]);
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    const newCompetitors = competitors.filter((_, i) => i !== index);
    setCompetitors(newCompetitors.length ? newCompetitors : [""]);
  };

  const handleCompetitorChange = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, competitors: competitors.filter(c => c.trim() !== "") }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Phân tích thất bại");
      }

      setResult(data);
      setHistory(prev => [{ url, score: data.score, date: new Date().toLocaleDateString('vi-VN') }, ...prev].slice(0, 6));
      
      // Hiển thị modal thu thập Lead sau khi có kết quả
      if (!leadSubmitted) {
        setShowLeadModal(true);
      }
    } catch (err: any) {
      console.error("Analysis failed", err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f8fafc", // slate-50
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      const imgWidth = canvas.width / 2;
      const imgHeight = canvas.height / 2;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`SEO-Report-${url.replace(/^https?:\/\//, "").replace(/[\/.]/g, "-")}.pdf`);
    } catch (error) {
      console.error("PDF export failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadCSV = () => {
    if (!result) return;
    
    let csv = "Category,Metric,Value,Source\n";
    csv += `Overall,SEO Score,${result.score},SEO & GEO Pro\n`;
    Object.entries(result.metrics).forEach(([key, m]) => {
      csv += `Metrics,${m.label},${m.score},${m.source}\n`;
    });
    csv += `AI,Readiness,${result.aiOptimization.readinessScore},GEO Framework\n`;
    csv += `AI,Structured Data,${result.aiOptimization.structuredData},Schema.org\n`;
    csv += `AI,Robots Allowed,${result.aiOptimization.robotsAllowed},Bot Access\n`;
    csv += `EEAT,Overall Score,${result.eeat.overallScore},Google Quality Raters\n`;
    csv += `EEAT,Expertise,${result.eeat.expertise},Google Quality Raters\n`;
    csv += `EEAT,Experience,${result.eeat.experience},Google Quality Raters\n`;
    csv += `EEAT,Authoritativeness,${result.eeat.authoritativeness},Google Quality Raters\n`;
    csv += `EEAT,Trustworthiness,${result.eeat.trustworthiness},Google Quality Raters\n`;
    csv += `VoiceSearch,Score,${result.voiceSearch.score},Voice Search Checker\n`;
    csv += `VoiceSearch,Readability,${result.voiceSearch.readabilityLevel},Voice Search Checker\n`;
    
    result.recommendations.forEach((rec, i) => {
      csv += `Recommendation,${rec.priority} Priority,${rec.title},${rec.category}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `SEO-Report-${result.score}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const radarData = result ? [
    { subject: 'Performance', A: result.metrics.performance.score, fullMark: 100 },
    { subject: 'Technical', A: result.metrics.technical.score, fullMark: 100 },
    { subject: 'Accessibility', A: result.metrics.accessibility.score, fullMark: 100 },
    { subject: 'Best Practices', A: result.metrics.bestPractices.score, fullMark: 100 },
    { subject: 'AI Readiness', A: result.aiOptimization.readinessScore, fullMark: 100 },
  ] : [];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-600";
    if (score >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreBorder = (score: number) => {
    if (score >= 90) return "border-green-600";
    if (score >= 70) return "border-amber-500";
    return "border-red-500";
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail || !result) return;

    setIsSubmittingLead(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: leadEmail,
          url: url,
          score: result.score
        }),
      });

      if (response.ok) {
        setLeadSubmitted(true);
        setTimeout(() => setShowLeadModal(false), 3000);
      }
    } catch (error) {
      console.error("Lead submission failed", error);
      // Vẫn đóng modal để không làm phiền người dùng
      setShowLeadModal(false);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Lead Capture Modal */}
      <AnimatePresence>
        {showLeadModal && result && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowLeadModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>

              <div className="p-8 sm:p-10">
                {!leadSubmitted ? (
                  <>
                    <div className="mb-6 flex justify-center">
                      <div className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
                        <Sparkles className="h-10 w-10 text-indigo-600" />
                      </div>
                    </div>
                    
                    <h2 className="text-center text-2xl font-black text-slate-900 sm:text-3xl leading-tight">
                      Nhận Báo Cáo <br />
                      <span className="text-indigo-600">Lộ Trình SEO Chi Tiết</span>
                    </h2>
                    
                    <p className="mt-4 text-center text-slate-600">
                      Chúc mừng! Website của bạn đạt <span className={`font-bold ${getScoreColor(result.score)}`}>{result.score}/100</span> điểm. 
                      Chúng tôi đã chuẩn bị lộ trình tối ưu hoá riêng cho bạn.
                    </p>

                    <form onSubmit={handleSubmitLead} className="mt-8 space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ Email nhận báo cáo</label>
                        <input
                          type="email"
                          required
                          value={leadEmail}
                          onChange={(e) => setLeadEmail(e.target.value)}
                          placeholder="your-email@example.com"
                          className="block w-full rounded-xl border-0 py-4 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmittingLead}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-70"
                      >
                        {isSubmittingLead ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            Gửi báo cáo cho tôi
                            <ChevronLeft className="h-5 w-5 rotate-180" />
                          </>
                        )}
                      </button>
                      
                      <p className="text-center text-[10px] text-slate-400">
                        * Chúng tôi cam kết bảo mật thông tin và không spam.
                      </p>
                    </form>
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-10 text-center"
                  >
                    <div className="mb-6 flex justify-center">
                      <div className="rounded-full bg-green-50 p-6">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Tuyệt vời!</h2>
                    <p className="mt-4 text-slate-600">
                      Báo cáo đã được gửi tới email của bạn! <br />
                      Vui lòng kiểm tra hộp thư đến (hoặc spam) trong giây lát.
                    </p>
                    <button 
                      onClick={() => setShowLeadModal(false)}
                      className="mt-8 text-sm font-bold text-indigo-600 hover:underline"
                    >
                      Tiếp tục xem kết quả trên màn hình
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-indigo-600">
            <LayoutDashboard className="h-6 w-6" />
            <span>SEO & GEO Pro by PHL</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Version 2026.1</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {!result && (
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/10 mb-6">
                Công cụ phân tích SEO & AI Miễn phí
              </span>
              <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-7xl leading-tight">
                Tối ưu hoá website <br />
                <span className="text-indigo-600">cho Google & AI</span>
              </h1>
              <p className="mt-8 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
                Kiểm tra SEO truyền thống và tối ưu hóa khả năng hiển thị trên AI Search (GEO) dựa trên các tiêu chuẩn quốc tế mới nhất 2026.
              </p>
            </motion.div>
            
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleAnalyze}
              className="mt-12 mx-auto max-w-3xl space-y-6"
            >
              <div className="space-y-2 text-left">
                <label className="text-sm font-bold text-slate-700 ml-2 uppercase tracking-wider">Website của bạn</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Globe className="h-6 w-6 text-indigo-500" aria-hidden="true" />
                  </div>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://website-cua-ban.com"
                    className="block w-full rounded-2xl border-0 py-5 pl-12 pr-4 text-slate-900 shadow-xl ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg"
                  />
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between px-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Đối thủ cạnh tranh (Tối đa 3)</label>
                  {competitors.length < 3 && (
                    <button 
                      type="button"
                      onClick={handleAddCompetitor}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500"
                    >
                      <Plus className="h-3 w-3" /> Thêm đối thủ
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {competitors.map((comp, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative group"
                    >
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <TrendingUp className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-400" />
                      </div>
                      <input
                        type="url"
                        value={comp}
                        onChange={(e) => handleCompetitorChange(index, e.target.value)}
                        placeholder={`Đối thủ ${index + 1} (https://...)`}
                        className="block w-full rounded-xl border-0 py-4 pl-11 pr-12 text-slate-900 shadow-md ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm"
                      />
                      {competitors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCompetitor(index)}
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-10 py-5 text-xl font-bold text-white shadow-2xl shadow-indigo-200 hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent" />
                      Đang phân tích dữ liệu...
                    </>
                  ) : (
                    <>
                      <Search className="h-6 w-6" />
                      Bắt đầu so sánh & Chấm điểm
                    </>
                  )}
                </button>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-medium"
                >
                  <XCircle className="h-5 w-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </motion.form>

            {/* History Section (Simulating Data Model) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-20 max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-2 mb-6 px-4">
                <History className="h-5 w-5 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Lịch sử kiểm tra gần đây</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                {history.map((item, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-sm font-bold text-slate-800 truncate">{item.url}</span>
                      <span className="text-[10px] text-slate-400">{item.date}</span>
                    </div>
                    <div className={`text-lg font-black ${getScoreColor(item.score)}`}>{item.score}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto px-4 py-8"
          >
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <button 
                onClick={() => setResult(null)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Quay lại trang chủ
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={downloadCSV}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <FileSpreadsheet className="h-4 w-4" /> CSV
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
                  <Share2 className="h-4 w-4" /> Chia sẻ
                </button>
                <button 
                  onClick={downloadPDF}
                  disabled={isDownloading}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-70"
                >
                  {isDownloading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> Tải báo cáo PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            <div ref={reportRef} className="bg-slate-50 p-8 rounded-3xl">
              {/* Report Header (Visible in PDF) */}
              <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
                <div className="flex items-center gap-2 font-bold text-indigo-600">
                  <LayoutDashboard className="h-8 w-8" />
                  <span className="text-2xl">SEO & GEO Pro by PHL</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">Báo cáo phân tích Website</p>
                  <p className="text-xs text-slate-500">{url}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
                  {result._meta?.cached && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-green-100 text-green-600 text-[9px] font-bold uppercase tracking-widest">
                      Đã lấy từ Cache
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Left Column: Summary & Basic Stats */}
              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100 flex flex-col items-center text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-8">Tổng quan hiệu quả</h3>
                  <div className={`relative flex h-48 w-48 items-center justify-center rounded-full border-[12px] ${getScoreBorder(result.score)}`}>
                    <div className="text-6xl font-black text-slate-900">{result.score}</div>
                    <div className="absolute -bottom-4 bg-white px-4 py-1 rounded-full shadow-md border border-slate-100">
                      <span className={`text-sm font-bold uppercase tracking-widest ${getScoreColor(result.score)}`}>
                        {result.score >= 90 ? "Xuất sắc" : result.score >= 70 ? "Khá tốt" : "Cần cải thiện"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-8 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Radar
                          name="SEO Profile"
                          dataKey="A"
                          stroke="#4f46e5"
                          fill="#4f46e5"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Optimization Roadmap Section */}
                <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-50">
                        <Target className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">Lộ trình tối ưu hóa chi tiết</h4>
                        <p className="text-xs text-slate-400">Các hành động cụ thể để cải thiện thứ hạng và khả năng hiển thị AI</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group">
                        <div className="flex-shrink-0">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            rec.priority === 'High' ? 'bg-red-100 text-red-600' :
                            rec.priority === 'Medium' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <AlertTriangle className="h-3 w-3" />
                            {rec.priority} Priority
                          </div>
                        </div>
                        <div className="flex-grow space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase">{rec.category}</span>
                            <h5 className="font-bold text-slate-900">{rec.title}</h5>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{rec.description}</p>
                          <div className="flex items-center gap-2 pt-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-bold text-slate-700">Tác động kỳ vọng: </span>
                            <span className="text-xs text-slate-600">{rec.impact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <Info className="h-5 w-5 text-indigo-500" /> Thông số cơ bản
                  </h4>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-50">
                          <Calendar className="h-4 w-4 text-slate-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">Cập nhật cuối</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{result.basicInfo.lastUpdated}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-50">
                          <Users className="h-4 w-4 text-slate-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">Traffic hàng tháng</span>
                      </div>
                      <span className="text-sm font-bold text-indigo-600">{result.basicInfo.monthlyTraffic}</span>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Nguồn Traffic chính</p>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={result.basicInfo.trafficSources}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {result.basicInfo.trafficSources.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {result.basicInfo.trafficSources.map((source) => (
                          <div key={source.name} className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: source.color }} />
                            <span className="text-[10px] font-medium text-slate-500 truncate">{source.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <MapPin className="h-5 w-5 text-indigo-500" /> Local SEO Presence
                  </h4>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Google Maps (GMB)</span>
                      {result.localSEO.isGMBActive ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Đang hoạt động</span>
                      ) : (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Chưa kích hoạt</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Xếp hạng địa phương</span>
                      <span className="text-sm font-bold text-indigo-600">Top {result.localSEO.localRanking}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Từ khóa địa phương rank tốt</p>
                      <div className="flex flex-wrap gap-2">
                        {result.localSEO.localKeywords.map((kw, i) => (
                          <span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-900 p-8 shadow-xl text-white">
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-400">
                    <Shield className="h-5 w-5" /> Nguồn tiêu chí đánh giá
                  </h4>
                  <div className="space-y-4">
                    {[
                      { name: "Google Lighthouse", desc: "Tốc độ & Hiệu năng" },
                      { name: "W3C Standards", desc: "Cấu trúc HTML & Kỹ thuật" },
                      { name: "WCAG 2.1", desc: "Khả năng tiếp cận" },
                      { name: "Schema.org", desc: "Dữ liệu cấu trúc AI" },
                      { name: "OpenAI Guidelines", desc: "Tối ưu hóa Bot AI" }
                    ].map((source) => (
                      <div key={source.name} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-sm">{source.name}</p>
                          <p className="text-xs text-slate-400">{source.desc}</p>
                        </div>
                        <ExternalLink className="h-3 w-3 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Metrics */}
              <div className="lg:col-span-8 space-y-8">
                {/* AI Suggestions Section (Wow Factor #1) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl bg-gradient-to-br from-fuchsia-600 to-pink-700 p-8 shadow-xl text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="h-32 w-32" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                        <Sparkles className="h-7 w-7 text-pink-200" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold">AI Content Magic</h4>
                        <p className="text-pink-100 text-sm">Đề xuất tối ưu tự động từ AI (Gemini/Claude)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {result.aiSuggestions.map((suggestion, i) => (
                        <div key={i} className="bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all group">
                          <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 rounded-full bg-pink-500/30 text-[10px] font-bold uppercase tracking-wider border border-pink-400/30">
                              {suggestion.focus}
                            </span>
                            <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-bold text-pink-200 uppercase mb-1">Tiêu đề (Title) đề xuất:</p>
                              <h5 className="font-bold text-lg leading-tight">{suggestion.title}</h5>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-pink-200 uppercase mb-1">Mô tả (Meta Description):</p>
                              <p className="text-sm text-pink-50 leading-relaxed italic">"{suggestion.metaDescription}"</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* AI Optimization (GEO) Section */}
                <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 shadow-xl text-white">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                        <BrainCircuit className="h-7 w-7" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold">AI Optimization (GEO)</h4>
                        <p className="text-indigo-100 text-sm italic">Nguồn: Schema.org & GEO Framework</p>
                      </div>
                    </div>
                    <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md text-center">
                      <div className="text-3xl font-black">{result.aiOptimization.readinessScore}%</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">AI Readiness</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center gap-2 mb-2 text-indigo-100 font-bold text-sm">
                        <FileJson className="h-4 w-4" /> Structured Data
                      </div>
                      <div className="flex items-center gap-2">
                        {result.aiOptimization.structuredData ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
                        <span className="font-bold text-sm">{result.aiOptimization.structuredData ? "Đã tối ưu" : "Chưa có JSON-LD"}</span>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center gap-2 mb-2 text-indigo-100 font-bold text-sm">
                        <Bot className="h-4 w-4" /> AI Crawlers
                      </div>
                      <div className="flex items-center gap-2">
                        {result.aiOptimization.robotsAllowed ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
                        <span className="font-bold text-sm">{result.aiOptimization.robotsAllowed ? "Cho phép AI" : "Đang chặn AI Bot"}</span>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center gap-2 mb-2 text-indigo-100 font-bold text-sm">
                        <MessageSquareText className="h-4 w-4" /> Citation Prob.
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-200" />
                        <span className="font-bold text-sm">{result.aiOptimization.citationProbability}% khả năng</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h5 className="font-bold mb-4 flex items-center gap-2">
                      <Info className="h-4 w-4" /> Đề xuất tối ưu cho AI:
                    </h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.aiOptimization.aiRecommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-indigo-50 bg-white/5 p-3 rounded-xl border border-white/5">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-300 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/10">
                    <h5 className="font-bold mb-4 flex items-center gap-2">
                      <Fingerprint className="h-4 w-4 text-indigo-300" /> Thực thể (Entities) AI nhận diện:
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {result.aiOptimization.entities.map((entity, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                          <div className="text-[10px] font-bold text-indigo-300 uppercase mb-1">{entity.type}</div>
                          <div className="text-xs font-bold truncate">{entity.name}</div>
                          <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400" style={{ width: `${entity.relevance}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Key className="h-5 w-5 text-indigo-500" /> Từ khóa tối ưu hiện có
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">Phân tích mật độ và thứ hạng từ khóa</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.basicInfo.topKeywords.map((kw, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 hover:bg-white transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm group-hover:text-indigo-500">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{kw.word}</p>
                            <p className="text-[10px] text-slate-400">Volume: {kw.volume}/tháng</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold ${
                            kw.difficulty === 'Thấp' ? 'bg-green-100 text-green-600' :
                            kw.difficulty === 'Trung bình' ? 'bg-amber-100 text-amber-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {kw.difficulty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {Object.entries(result.metrics).map(([key, item]) => (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-100 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-indigo-600 bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                            <Zap className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{item.label}</span>
                            <span className="text-[10px] font-medium text-slate-400 italic">Nguồn: {item.source}</span>
                          </div>
                        </div>
                        <span className={`text-2xl font-black ${getScoreColor(item.score)}`}>{item.score}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-1">{item.description}</p>
                      <div className="h-1.5 w-full rounded-full bg-slate-100">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-1.5 rounded-full ${getScoreBg(item.score)}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* E-E-A-T Analysis Section */}
                  <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-50">
                          <Award className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">Phân tích E-E-A-T</h4>
                          <p className="text-[10px] text-slate-400">Độ tin cậy & Chuyên gia</p>
                        </div>
                      </div>
                      <div className={`text-2xl font-black ${getScoreColor(result.eeat.overallScore)}`}>
                        {result.eeat.overallScore}%
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Experience", score: result.eeat.experience, icon: HeartPulse },
                        { label: "Expertise", score: result.eeat.expertise, icon: BrainCircuit },
                        { label: "Authoritativeness", score: result.eeat.authoritativeness, icon: Shield },
                        { label: "Trustworthiness", score: result.eeat.trustworthiness, icon: UserCheck },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <div className="flex items-center gap-2">
                              <item.icon className="h-3 w-3 text-slate-400" />
                              <span>{item.label}</span>
                            </div>
                            <span>{item.score}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${getScoreBg(item.score)}`} 
                              style={{ width: `${item.score}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Voice Search Optimization Section */}
                  <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-50">
                          <Mic className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">Voice Search</h4>
                          <p className="text-[10px] text-slate-400">Tối ưu tìm kiếm giọng nói</p>
                        </div>
                      </div>
                      <div className={`text-2xl font-black ${getScoreColor(result.voiceSearch.score)}`}>
                        {result.voiceSearch.score}%
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Độ đọc hiểu (Readability)</div>
                        <div className="text-sm font-bold text-slate-800">{result.voiceSearch.readabilityLevel}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Câu hỏi (FAQ)</div>
                          <div className="text-sm font-bold text-slate-800">{result.voiceSearch.questionCoverage}%</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Đàm thoại</div>
                          <div className="text-sm font-bold text-slate-800">{result.voiceSearch.conversationalTone}%</div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">Dựa trên phân tích ngôn ngữ tự nhiên (NLP) cho trợ lý ảo.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-green-100 bg-green-50/30 p-8">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-green-800 mb-6">
                      <CheckCircle2 className="h-6 w-6" /> Điểm mạnh của bạn
                    </h4>
                    <ul className="space-y-4">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700">
                          <div className="mt-1 h-2 w-2 rounded-full bg-green-500 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                          <p className="text-sm font-medium">{s}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-red-100 bg-red-50/30 p-8">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-red-800 mb-6">
                      <XCircle className="h-6 w-6" /> Cần cải thiện ngay
                    </h4>
                    <ul className="space-y-4">
                      {result.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700">
                          <div className="mt-1 h-2 w-2 rounded-full bg-red-500 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          <p className="text-sm font-medium">{w}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">So sánh đối thủ thực tế</h4>
                      <p className="text-xs text-slate-400 mt-1">Phân tích dựa trên các link bạn đã nhập</p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Website</th>
                          <th className="py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">SEO Score</th>
                          <th className="py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Backlinks</th>
                          <th className="py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Domain Auth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        <tr className="bg-indigo-50/40">
                          <td className="py-5 font-bold text-indigo-600 pl-4 rounded-l-xl">Bạn ({url.replace(/^https?:\/\//, '').replace(/\/$/, '')})</td>
                          <td className="py-5 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black text-white ${getScoreBg(result.score)}`}>
                              {result.score}
                            </span>
                          </td>
                          <td className="py-5 text-center font-bold text-slate-700 text-sm">2.5k</td>
                          <td className="py-5 text-center font-bold text-slate-700 text-sm pr-4 rounded-r-xl">48</td>
                        </tr>
                        {result.competitors.map((comp, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="py-5 font-medium text-slate-600 pl-4 text-sm truncate max-w-[200px]">{comp.url}</td>
                            <td className="py-5 text-center font-bold text-slate-800 text-sm">{comp.score}</td>
                            <td className="py-5 text-center font-medium text-slate-600 text-sm">{comp.backlinks}</td>
                            <td className="py-5 text-center font-medium text-slate-600 text-sm pr-4">{comp.domainAuthority}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 font-bold text-indigo-600 mb-4">
            <LayoutDashboard className="h-6 w-6" />
            <span>SEO & GEO Pro by PHL</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 SEO & GEO Pro by PHL. Đã đăng ký bản quyền.</p>
        </div>
      </footer>
    </main>
  );
}
