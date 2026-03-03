import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Mail, Copy, Wallet, ExternalLink, CheckCircle2, Calendar, Link, Download, Plus, FolderGit2, Award, Flag, Trophy, FileText, FileCheck, X, Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProofStats, getUserProofs } from '../../utils/proofsApi';
import { getCurrentUser } from '../../utils/supabaseAuth';
import { getProfile } from '../../utils/profileApi';
import logo from '../../assets/ghonsi-proof-logos/transparent-png-logo/4.png';

// Helper function to truncate wallet address
const truncateWalletAddress = (address) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};

// ─── JSON Metadata Modal ──────────────────────────────────────────────────────
const MetadataModal = ({ proof, onClose }) => {
  const [metadataJson, setMetadataJson] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!proof) return;

    console.log('[MetadataModal] proof keys:', Object.keys(proof));
    console.log('[MetadataModal] metadata_ipfs_url:', proof.metadata_ipfs_url);
    console.log('[MetadataModal] file_ipfs_url:', proof.file_ipfs_url);
    console.log('[MetadataModal] extracted_data:', proof.extracted_data);
    console.log('[MetadataModal] files:', proof.files);

    // Priority 1: metadata_ipfs_url (the JSON metadata file on Pinata)
    if (proof.metadata_ipfs_url) {
      setIsLoading(true);
      setFetchError(false);
      fetch(proof.metadata_ipfs_url)
        .then((r) => {
          if (!r.ok) throw new Error('Failed to fetch');
          return r.json();
        })
        .then((data) => {
          console.log('[MetadataModal] fetched IPFS JSON:', data);
          setMetadataJson(data);
        })
        .catch((err) => {
          console.warn('[MetadataModal] IPFS fetch failed, falling back to extracted_data:', err);
          setFetchError(true);
          setMetadataJson(proof.extracted_data || null);
        })
        .finally(() => setIsLoading(false));
      return;
    }

    // Priority 2: extracted_data column in DB
    if (proof.extracted_data) {
      console.log('[MetadataModal] using extracted_data from DB');
      setMetadataJson(proof.extracted_data);
      return;
    }

    // Priority 3: build a summary object from the proof row itself
    // so the modal always shows *something* useful
    console.log('[MetadataModal] no metadata/extracted_data — building from proof row');
    setMetadataJson({
      proof_id: proof.id,
      proof_name: proof.proof_name,
      proof_type: proof.proof_type,
      summary: proof.summary,
      status: proof.status,
      reference_link: proof.reference_link || null,
      blockchain_tx: proof.blockchain_tx || null,
      file_ipfs_url: proof.file_ipfs_url || null,
      created_at: proof.created_at,
      note: 'No extracted metadata available — showing proof record data',
    });
  }, [proof]);

  const handleCopy = () => {
    if (!metadataJson) return;
    navigator.clipboard.writeText(JSON.stringify(metadataJson, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Syntax-colour JSON: strings gold, keys white, numbers/booleans/null blue
  const renderSyntaxJson = (obj) => {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-blue-300';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'text-gray-300' : 'text-[#C19A4A]';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  if (!proof) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient border */}
        <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 shadow-2xl flex flex-col max-h-[85vh]">
          <div className="bg-[#0d1020] rounded-[14px] flex flex-col overflow-hidden max-h-[85vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#C19A4A]/15 border border-[#C19A4A]/30 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-[#C19A4A]" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{proof.proof_name}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {fetchError ? 'Extracted Data (IPFS unavailable)' : proof.metadata_ipfs_url ? 'IPFS Metadata JSON' : 'Extracted Data'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {metadataJson && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C19A4A]/10 border border-[#C19A4A]/20 text-[#C19A4A] text-[11px] font-semibold hover:bg-[#C19A4A]/20 transition-colors"
                  >
                    {copied ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
                {proof.metadata_ipfs_url && (
                  <a
                    href={proof.metadata_ipfs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold hover:bg-blue-500/20 transition-colors"
                  >
                    <ExternalLink size={12} /> IPFS
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Proof meta strip */}
            <div className="flex items-center gap-4 px-5 py-3 bg-[#C19A4A]/5 border-b border-white/5 shrink-0 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <Award size={12} className="text-[#C19A4A]" />
                <span className="capitalize">{proof.proof_type?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <Calendar size={12} />
                {new Date(proof.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              {proof.blockchain_tx && (
                <a
                  href={`https://solscan.io/tx/${proof.blockchain_tx}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-[#C19A4A] hover:underline ml-auto"
                >
                  <Link size={11} />
                  {proof.blockchain_tx.slice(0, 8)}...{proof.blockchain_tx.slice(-6)}
                  <ExternalLink size={10} />
                </a>
              )}
            </div>

            {/* JSON Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 size={28} className="text-[#C19A4A] animate-spin" />
                  <p className="text-gray-400 text-sm">Fetching metadata from IPFS...</p>
                </div>
              ) : metadataJson ? (
                <pre
                  className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: renderSyntaxJson(metadataJson) }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <FileText size={22} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-sm">No metadata available for this proof.</p>
                  <p className="text-gray-600 text-xs">Upload a document to generate extracted metadata.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Auto-skill extraction - skills derived from extracted_data with confidence threshold
export default function Portfolio() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Proofs');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [emailCopied, setEmailCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [stats, setStats] = useState({ total: 0, verified: 0 });
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [portfolioLinkCopied, setPortfolioLinkCopied] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // for PDF/image viewer
  const tabsRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');

        const currentUser = await getCurrentUser();
        const targetUserId = userId || currentUser?.id;

        if (targetUserId) {
          setUser(currentUser);
          const profileData = await getProfile(targetUserId);
          setProfile(profileData);
          const userProofs = await getUserProofs(targetUserId);
          setProofs(userProofs);
          const liveStats = await getProofStats(targetUserId);
          setStats({ total: liveStats.total, verified: liveStats.verified });
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      }
    };
    loadProfileData();
  }, []);

  // Auto-generate skills from proofs extracted_data; fall back to profile.skills if no extracted skills
  const autoSkills = useMemo(() => {
    // Filter proofs where extracted_data.normalizedSkills exists and has items
    const proofsWithSkills = proofs.filter(proof => {
      const extracted = proof?.extracted_data;
      return extracted?.normalizedSkills && Array.isArray(extracted.normalizedSkills) && extracted.normalizedSkills.length > 0;
    });

    // Flatten and deduplicate
    const skillsSet = new Set();
    proofsWithSkills.forEach(proof => {
      const normalizedSkills = proof.extracted_data.normalizedSkills;
      normalizedSkills.forEach(skill => skillsSet.add(skill));
    });

    const fromProofs = Array.from(skillsSet);
    if (fromProofs.length > 0) return fromProofs;
    
    // Fallback to profile.skills
    return profile?.skills || [];
  }, [proofs, profile]);

  const copyEmail = () => {
    const emailToCopy = profile?.users?.email || profile?.email || '';
    if (emailToCopy) {
      navigator.clipboard.writeText(emailToCopy).then(() => {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      });
    }
  };

  const handleSharePortfolio = () => {
    const portfolioUrl = `${window.location.origin}/portfolio?id=${user?.id}`;
    navigator.clipboard.writeText(portfolioUrl).then(() => {
      setPortfolioLinkCopied(true);
      setTimeout(() => setPortfolioLinkCopied(false), 2000);
    });
  };

  const renderSocialLinks = () => {
    if (!profile?.social_links) return null;
    const { twitter, github, linkedin } = profile.social_links;
    return (
      <div className="flex flex-wrap gap-2">
        {twitter && (
          <a href={twitter.startsWith('http') ? twitter : `https://x.com/${twitter}`} target="_blank" rel="noreferrer"
            className="bg-[#0B0F1B]/50 hover:bg-white/5 border border-white/5 rounded px-2 py-1 flex items-center gap-1.5 transition-colors">
            <span className="text-[10px] text-white">Twitter</span>
          </a>
        )}
        {github && (
          <a href={github.startsWith('http') ? github : `https://github.com/${github}`} target="_blank" rel="noreferrer"
            className="bg-[#0B0F1B]/50 hover:bg-white/5 border border-white/5 rounded px-2 py-1 flex items-center gap-1.5 transition-colors">
            <span className="text-[10px] text-white">GitHub</span>
          </a>
        )}
        {linkedin && (
          <a href={linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}`} target="_blank" rel="noreferrer"
            className="bg-[#0B0F1B]/50 hover:bg-white/5 border border-white/5 rounded px-2 py-1 flex items-center gap-1.5 transition-colors">
            <span className="text-[10px] text-white">LinkedIn</span>
          </a>
        )}
      </div>
    );
  };

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '??';

  const tabs = [
    { name: 'All Proofs', value: 'All Proofs', count: proofs.length },
    { name: 'Work History', value: 'job_history', count: proofs.filter(p => p.proof_type === 'job_history').length },
    { name: 'Certificates', value: 'certificates', count: proofs.filter(p => p.proof_type === 'certificates').length },
    { name: 'Milestones', value: 'milestones', count: proofs.filter(p => p.proof_type === 'milestones').length },
    { name: 'Community Contributions', value: 'community_contributions', count: proofs.filter(p => p.proof_type === 'community_contributions').length },
    { name: 'Skills', value: 'skills', count: proofs.filter(p => p.proof_type === 'skills').length },
  ];

  const activeTabValue = tabs.find(t => t.name === activeTab)?.value || 'All Proofs';
  const filteredProofs = activeTabValue === 'All Proofs'
    ? proofs
    : proofs.filter(p => p.proof_type === activeTabValue);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - tabsRef.current.offsetLeft);
    setScrollLeft(tabsRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    tabsRef.current.scrollLeft = scrollLeft - (x - startX) * 2;
  };

  const navItemClass = windowWidth < 700 ? 'text-[9px]' : 'text-[11px]';

  return (
    <div className="min-h-screen pb-20 w-full bg-[#0B0F1B] text-white selection:bg-[#C19A4A]/30 relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Background blobs */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
      </div>
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(90deg,rgba(193,154,74,0.1) 1px,transparent 1px),linear-gradient(0deg,rgba(193,154,74,0.1) 1px,transparent 1px)`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Metadata JSON Modal */}
      {selectedProof && (
        <MetadataModal proof={selectedProof} onClose={() => setSelectedProof(null)} />
      )}

      {/* File Viewer Modal (PDF / image) */}
      {selectedFile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[85vh] bg-[#111625] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d1020]">
              <div className="flex items-center gap-2">
                <FileCheck size={14} className="text-blue-400" />
                <span className="text-sm font-semibold text-white truncate max-w-[200px]">
                  {selectedFile.filename || 'Document'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedFile.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold hover:bg-blue-500/20 transition-colors"
                >
                  <ExternalLink size={11} /> Open
                </a>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Content */}
            {selectedFile.mime_type?.includes('image') ? (
              <img
                src={selectedFile.file_url}
                alt="Proof document"
                className="max-h-[75vh] w-auto object-contain"
              />
            ) : selectedFile.mime_type?.includes('pdf') ? (
              <iframe
                src={selectedFile.file_url}
                className="w-[85vw] h-[75vh] max-w-4xl"
                title="Proof PDF"
              />
            ) : (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                <FileCheck size={32} className="text-gray-600" />
                <p className="text-sm">Preview not available for this file type.</p>
                <a
                  href={selectedFile.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-xs hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={11} /> Open file directly
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 sticky top-0 z-50 bg-[#0B0F1B]/95 backdrop-blur-sm border-b border-white/5">
        <button onClick={() => navigate('/')} className="bg-transparent border-none p-0 cursor-pointer">
          <img src={logo} alt="Logo" style={{ width: 'auto', height: '75px' }} />
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className={`${navItemClass} text-white cursor-pointer hover:text-[#C19A4A] transition-colors bg-transparent border-none`}>Home</button>
          <button onClick={() => navigate(`/request?id=${user?.id}`)} className={`${navItemClass} text-white cursor-pointer hover:text-[#C19A4A] transition-colors bg-transparent border-none`}>Public Profile</button>
          <button onClick={handleSharePortfolio} className="ml-2 bg-[#C19A4A] text-black text-[9px] px-3 py-1.5 rounded-md font-semibold flex items-center gap-2 hover:bg-[#a8853b] transition-colors">
            <Share2 size={14} /> <span>{portfolioLinkCopied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 md:px-8 relative z-10"
        style={{ paddingTop: windowWidth < 640 ? '12px' : windowWidth < 1024 ? '60px' : '30px' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
              <div className="relative bg-[#111625] rounded-2xl p-5">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-[#d9b563]/5 rounded-2xl" />
                <div className="relative z-10 flex gap-4 items-start">

                  {/* Avatar */}
                  <div className="shrink-0" style={{ width: 72 }}>
                    <div className="relative" style={{ width: 72, height: 72 }}>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] blur-lg opacity-40" />
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.display_name}
                          style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid #C19A4A', objectFit: 'cover', display: 'block', position: 'relative' }}
                        />
                      ) : (
                        <div style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid #C19A4A', background: 'rgba(193,154,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <span className="text-xl font-bold text-[#C19A4A]">{initials}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile info */}
                  <div className="flex-1 min-w-0 p-3">
                    <h1 className="text-lg font-bold text-white leading-tight mb-0.5">
                      {profile?.display_name || 'Anonymous User'}
                    </h1>
                    {profile?.profession && (
                      <p className="text-xs text-[#C19A4A] font-medium mb-2">{profile.profession}</p>
                    )}
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">
                      {profile?.bio || 'No bio available'}
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#0B0F1B]/60 rounded-lg border border-white/5 min-w-0">
                        <Mail size={11} className="text-[#C19A4A] shrink-0" />
                        {(profile?.users?.email || profile?.email) ? (
                          <>
                            <span className="text-[10px] text-gray-400 truncate flex-1 min-w-0">{profile?.users?.email || profile?.email}</span>
                            <button
                              onClick={copyEmail}
                              style={{ flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                              className="text-gray-500 hover:text-[#C19A4A] transition-colors"
                              aria-label="Copy email"
                            >
                              {emailCopied
                                ? <span className="text-[10px] text-[#22c55e]">✓</span>
                                : <Copy size={11} />}
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-gray-500 truncate flex-1 min-w-0">No email added</span>
                        )}
                      </div>
                      {profile?.users?.wallet_address ? (
                        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#0B0F1B]/60 rounded-lg border border-white/5 min-w-0">
                          <Wallet size={11} className="text-[#C19A4A] shrink-0" />
                          <code className="text-[10px] text-gray-400 font-mono truncate flex-1 min-w-0">
                            {truncateWalletAddress(profile.users.wallet_address)}
                          </code>
                          <a
                            href={`https://solscan.io/account/${profile.users.wallet_address}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ flexShrink: 0 }}
                            className="text-gray-500 hover:text-[#C19A4A] transition-colors"
                          >
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#0B0F1B]/60 rounded-lg border border-white/5 min-w-0">
                          <Wallet size={11} className="text-[#C19A4A] shrink-0" />
                          <span className="text-[10px] text-gray-400 truncate flex-1 min-w-0">No wallet connected</span>
                        </div>
                      )}
                    </div>

                    {renderSocialLinks()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Skills */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col gap-4">

            <div className="grid grid-cols-2 gap-4">
              <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A]/30 to-transparent">
                <div className="bg-[#1A1F2E] rounded-xl p-4 text-center h-full">
                  <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
                  <div className="text-xs text-gray-400">Total Proofs</div>
                </div>
              </div>
              <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563]">
                <div className="bg-[#1A1F2E] rounded-xl p-4 text-center h-full">
                  <div className="text-2xl font-bold text-[#C19A4A] mb-1">{stats.total}</div>
                  <div className="text-xs text-white">Verifiable</div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-white/10 to-transparent flex-1">
              <div className="bg-[#111625] rounded-xl p-5 h-full">
                <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-[#C19A4A] to-[#d9b563] rounded-full" />
                  Skills & Expertise
                </h2>
                <p className="text-[10px] text-gray-500 mb-3 pl-3">
                  {proofs.length > 0 ? 'Auto-detected from your proofs' : 'Upload proofs to auto-generate skills'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {autoSkills.length > 0 ? autoSkills.map(skill => (
                    <span key={skill}
                      className="text-xs text-[#C19A4A] bg-[#1A1F2E] border border-[#C19A4A]/20 px-3 py-1.5 rounded-full hover:bg-[#C19A4A]/10 transition-colors">
                      {skill}
                    </span>
                  )) : (
                    <span className="text-xs text-gray-600 italic">No skills detected yet</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}>
          <div ref={tabsRef}
            className={`flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 pb-2 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
            {tabs.map(tab => (
              <button key={tab.name} onClick={() => !isDragging && setActiveTab(tab.name)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === tab.name
                  ? 'bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-black shadow-[0_0_30px_rgba(193,154,74,0.3)]'
                  : 'bg-[#1A1F2E] text-white border border-white/5 hover:bg-[#252b3d] hover:border-[#C19A4A]/20'
                  }`}>
                {tab.name}{' '}
                <span className={`ml-1 text-[10px] ${activeTab === tab.name ? 'text-black/60' : 'text-gray-400'}`}>
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Proof cards */}
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {filteredProofs.map((proof, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }} className="group">
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent h-full">
                <div className="bg-[#111625] rounded-2xl border border-white/5 hover:border-[#C19A4A]/30 transition-all duration-300 h-full flex flex-col group-hover:shadow-[0_0_30px_rgba(193,154,74,0.15)]">

                  {/* ── Card thumbnail: file preview (original behaviour) ── */}
                  <div
                    className="relative h-32 overflow-hidden shrink-0 cursor-pointer rounded-t-2xl"
                    onClick={() => setSelectedFile(proof.files?.[0])}
                  >
                    {proof.files?.[0]?.mime_type?.includes('image') ? (
                      <img
                        src={proof.files[0].file_url}
                        alt={proof.proof_name}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500"
                      />
                    ) : proof.files?.[0]?.mime_type?.includes('pdf') ? (
                      <iframe
                        src={`${proof.files[0].file_url}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`}
                        className="w-full h-full pointer-events-none"
                        title="PDF preview"
                        style={{ transform: 'scale(1)', transformOrigin: 'top left' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1A1F2E] flex flex-col items-center justify-center gap-2">
                        <FileCheck size={28} className="text-gray-600" />
                        <span className="text-[10px] text-gray-500">No preview</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#111625] to-transparent" />

                    {/* Hover "View File" badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] text-white font-semibold bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <FileCheck size={12} /> View File
                      </span>
                    </div>

                    {/* Top-right: proof type pill */}
                    <div className="absolute top-2 right-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#C19A4A] bg-[#0B0F1B]/80 border border-[#C19A4A]/30 px-2 py-0.5 rounded-full">
                        {proof.proof_type?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 relative z-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 max-w-[calc(100%-40px)]">
                        <h3 className={`text-white font-semibold truncate ${proof.proof_name?.length > 30 ? 'text-[11px]' : 'text-[13px]'}`}
                          title={proof.proof_name}>{proof.proof_name}</h3>
                        {proof.status === 'verified' && (
                          <div className="flex items-center gap-0.5 text-[#22c55e] bg-[#22c55e]/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                            <CheckCircle2 size={12} />
                            <span className="font-medium text-[9px]">Verifiable</span>
                          </div>
                        )}
                        {proof.status === 'pending' && (
                          <div className="flex items-center gap-0.5 text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                            <Clock size={12} />
                            <span className="font-medium text-[9px]">Pending</span>
                          </div>
                        )}
                      </div>
                      <button className="text-gray-400 hover:text-[#C19A4A] transition-colors" aria-label="Share proof">
                        <Share2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <div className="flex items-center gap-1.5">
                        {proof.proof_type === 'Project' && <FolderGit2 size={14} className="text-[#C19A4A]" />}
                        {proof.proof_type === 'Certificate' && <Award size={14} className="text-[#C19A4A]" />}
                        {proof.proof_type === 'Milestone' && <Flag size={14} className="text-[#C19A4A]" />}
                        {proof.proof_type === 'Achievement' && <Trophy size={14} className="text-[#C19A4A]" />}
                        <span>{proof.proof_type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{new Date(proof.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed flex-1">{proof.summary}</p>

                    <div className="flex flex-wrap gap-2 mb-4 mt-4">
                      <span className="text-[10px] bg-[#1A1F2E] border border-[#C19A4A]/20 text-[#C19A4A] px-2 py-1 rounded-md font-mono">
                        GH-{proof.proof_type?.charAt(0).toUpperCase()}-{String(proof.id).padStart(3, '0')}
                      </span>
                    </div>

                    {/* ── On-chain row: [tx hash] [PDF] [JSON] ── */}
                    <div className="border-t border-white/10 pt-3 flex items-center gap-2 mt-auto">
                      <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0">
                        <Link size={12} />
                        <span>On-chain:</span>
                      </div>

                      {/* Tx hash — links to Solscan */}
                      {proof.blockchain_tx ? (
                        <a
                          href={`https://solscan.io/tx/${proof.blockchain_tx}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-0 bg-[#1A1F2E] border border-white/10 rounded px-2 py-1.5 flex items-center hover:border-[#C19A4A]/30 transition-colors"
                        >
                          <span className="font-mono text-[#C19A4A] text-xs truncate">
                            {proof.blockchain_tx.slice(0, 8)}...{proof.blockchain_tx.slice(-6)}
                          </span>
                        </a>
                      ) : (
                        <div className="flex-1 min-w-0 bg-[#1A1F2E] border border-white/10 rounded px-2 py-1.5 flex items-center">
                          <span className="font-mono text-gray-600 text-xs">Pending...</span>
                        </div>
                      )}

                      {/* PDF / file viewer button */}
                      {proof.files?.[0]?.file_url ? (
                        <button
                          onClick={() => setSelectedFile(proof.files[0])}
                          className="flex items-center gap-1 px-2 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors shrink-0"
                          title="View uploaded document"
                        >
                          <FileCheck size={12} />
                          <span className="text-[10px] font-semibold hidden sm:inline">PDF</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1.5 rounded bg-white/5 text-gray-600 shrink-0" title="No document">
                          <FileCheck size={12} />
                        </div>
                      )}

                      {/* JSON metadata button */}
                      <button
                        onClick={() => setSelectedProof(proof)}
                        className={`flex items-center gap-1 px-2 py-1.5 rounded transition-colors shrink-0 ${proof.metadata_ipfs_url || proof.extracted_data
                          ? 'text-[#C19A4A] bg-[#C19A4A]/10 border border-[#C19A4A]/20 hover:bg-[#C19A4A]/20'
                          : 'text-gray-600 bg-white/5 cursor-default'
                          }`}
                        title="View metadata JSON"
                        disabled={!proof.metadata_ipfs_url && !proof.extracted_data}
                      >
                        <FileText size={12} />
                        <span className="text-[10px] font-semibold hidden sm:inline">JSON</span>
                      </button>
                    </div>
                    {/* ─────────────────────────────────────────────────── */}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredProofs.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm col-span-full">
              No proofs found for this category.
            </div>
          )}
        </div>
      </main>

      
      {/* Floating action bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }} className="fixed bottom-2 left-3 right-3 z-40">
        <div className="w-full max-w-7xl mx-auto relative p-[2px] rounded-xl bg-gradient-to-r from-[#C19A4A] via-[#d9b563] to-blue-500">
          <div className="bg-[#1C1C1C]/95 backdrop-blur-md p-2 rounded-xl shadow-2xl flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white">Ready to Build Your Portfolio?</h4>
              <p className="text-[11px] text-gray-400 truncate">Start uploading your proofs and build your on-chain reputation</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => navigate('/upload')}
                className="px-3 py-2 rounded-lg border border-[#C19A4A] text-[#C19A4A] text-xs font-semibold hover:bg-[#C19A4A]/10 transition-colors flex items-center gap-1.5">
                <Download size={14} />
                <span className="hidden sm:inline">Export Portfolio</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button onClick={() => navigate('/upload')}
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-black text-xs font-semibold hover:shadow-[0_0_20px_rgba(193,154,74,0.4)] transition-all flex items-center gap-1.5">
                <Plus size={14} />
                <span className="hidden sm:inline">Add New Proof</span>
                <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%       { transform: translate(20px, -50px) scale(1.1); }
          50%       { transform: translate(-20px, 20px) scale(0.9); }
          75%       { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}