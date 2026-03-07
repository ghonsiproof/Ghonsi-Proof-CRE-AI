import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useConnection } from '@solana/wallet-adapter-react';
import { createTransferTransaction } from '../utils/transactionSigner';
import { Loader2, AlertCircle, ChevronDown, ChevronUp, FileJson } from 'lucide-react';
import '../pages/upload/upload.css';

/**
 * TransactionSignerModal
 *
 * Sole responsibility: get the user to sign and confirm a SOL transfer.
 * Once confirmed it calls onSuccess({ txHash, amount, documentData }) and
 * closes itself immediately — no success screen, no delay.
 * The parent (upload.jsx) owns all post-payment UI.
 */
const TransactionSignerModal = ({
  isOpen,
  onClose,
  onSuccess,
  amount = 0.01,
  treasuryAddress,
  documentData,
  extractedPreview,
}) => {
  const { publicKey, signTransaction, connected, connectWallet } = useWallet();
  const { connection } = useConnection();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Hard guard — prevents double-submission on re-render
  const isSubmittingRef = useRef(false);

  // Reset every time modal opens so there is never stale state.
  useEffect(() => {
    if (!isOpen) return;
    isSubmittingRef.current = false;
    setError(null);
    setIsLoading(false);
    setShowPreview(false);

    if (!publicKey || !treasuryAddress) return;
    setTransactionDetails({
      from: publicKey.toString(),
      to: treasuryAddress,
      amount: `${amount} SOL`,
      fee: '5,000 lamports (~$0.0000075)',
    });
  }, [isOpen, amount, publicKey, treasuryAddress]);

  const handleSignTransaction = async () => {
    if (isSubmittingRef.current) return;
    
    // If wallet is not connected, try to connect first
    if (!publicKey || !connected) {
      setError('Wallet not connected. Please connect your wallet first.');
      try {
        await connectWallet();
        // Check again after connection attempt - if still not connected, return
        if (!publicKey || !connected) {
          isSubmittingRef.current = false;
          setError('Could not connect to wallet. Please make sure Phantom is installed and unlocked.');
          return;
        }
      } catch (connectErr) {
        console.error('Wallet connection error:', connectErr);
        isSubmittingRef.current = false;
        setError('Could not connect to wallet. Please try again.');
        return;
      }
    }
    
    if (!treasuryAddress) {
      setError('Treasury address not configured.');
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('[v0] Starting transaction signing process');
      console.log('[v0] Wallet connected:', connected);
      console.log('[v0] PublicKey:', publicKey?.toString());

      // Create the transaction
      const transaction = await createTransferTransaction(
        publicKey,
        amount,
        treasuryAddress,
        connection
      );

      console.log('[v0] Requesting wallet signature');
      
      // Sign the transaction - this should trigger Phantom wallet popup
      let signedTx;
      try {
        signedTx = await signTransaction(transaction);
      } catch (signErr) {
        // If signing fails, it might be that Phantom didn't open the popup
        // This is common when the dApp URL isn't approved yet
        console.error('[v0] Sign transaction error:', signErr);
        
        // Check if it's a connection issue
        if (signErr.message?.includes('Wallet not connected') || 
            signErr.message?.includes('null')) {
          setError('Wallet connection issue. Please make sure Phantom is unlocked and try again.');
        } else if (signErr.message?.toLowerCase().includes('user rejected') ||
                   signErr.message?.includes('4001')) {
          setError('Transaction cancelled. Click "Sign & Send" to try again.');
        } else {
          setError('Wallet signing failed: ' + signErr.message);
        }
        isSubmittingRef.current = false;
        setIsLoading(false);
        return;
      }
      
      if (!signedTx) {
        // This can happen if Phantom popup was closed without signing
        setError('No signature received. Please try again and approve the transaction in your wallet.');
        isSubmittingRef.current = false;
        setIsLoading(false);
        return;
      }

      console.log('[v0] Sending signed transaction');
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      console.log('[v0] Confirming transaction:', signature);
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      if (confirmation.value.err) {
        throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('[v0] Transaction successful:', signature);

      onSuccess({ txHash: signature, amount, documentData });

    } catch (err) {
      console.error('[v0] Transaction error:', err);
      isSubmittingRef.current = false;

      if (
        err.message?.includes('4001') ||
        err.message?.toLowerCase().includes('user rejected') ||
        err.message?.toLowerCase().includes('rejected the request')
      ) {
        setError('Transaction cancelled. Click "Sign & Send" to try again.');
      } else if (err.message?.includes('already been processed')) {
        setError('This transaction was already submitted. Please close and try uploading again.');
      } else if (err.message?.includes('Blockhash not found')) {
        setError('Transaction expired. Please close and try again.');
      } else {
        setError(err.message || 'Failed to sign and send transaction.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Build a clean preview object from documentData — strip internal fields
  // the user doesn't need to see (userId, uploadedAt, walletAddress already shown above)
  const buildPreviewData = () => {
    if (extractedPreview) return extractedPreview;   // ← prefer extracted doc data from extraction API if available, as it's more user-friendly than raw documentData
    if (!documentData) return null;
    const {
      userId,        // internal — omit
      uploadedAt,    // internal — omit
      walletAddress, // already shown as "From" above
      ...visible
    } = documentData;
    return visible;
  };

  const previewData = buildPreviewData();

  // Syntax-colour a JSON string: strings gold, keys white, numbers/booleans/null blue
  const renderSyntaxJson = (obj) => {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-blue-300'; // numbers, booleans, null
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-gray-300'; // keys
          } else {
            cls = 'text-[#C19A4A]'; // string values — gold
          }
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  if (!isOpen) return null;

return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#0B0F1B] to-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Confirm Transaction</h2>
          {!isLoading && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              ✕
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4 text-center py-4">
            <div className="flex justify-center">
              <Loader2 size={40} className="text-[#C19A4A] animate-spin" />
            </div>
            <p className="text-white font-medium">Processing Transaction</p>
            <p className="text-sm text-gray-400">
              Please confirm in your wallet and wait for confirmation...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Transaction details */}
        {!isLoading && transactionDetails && (
          <div className="space-y-4 mb-6">
            <div className="space-y-3 bg-[#1a1f2e] border border-white/10 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">From</span>
                <span className="text-xs font-mono text-white">
                  {transactionDetails.from.slice(0, 8)}...{transactionDetails.from.slice(-8)}
                </span>
              </div>
              <div className="border-t border-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">To (Ghonsi Verification)</span>
                <span className="text-xs font-mono text-white">
                  {transactionDetails.to.slice(0, 8)}...{transactionDetails.to.slice(-8)}
                </span>
              </div>
              <div className="border-t border-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Amount</span>
                <span className="text-sm font-semibold text-[#C19A4A]">{transactionDetails.amount}</span>
              </div>
              <div className="border-t border-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Network Fee</span>
                <span className="text-xs text-gray-500">{transactionDetails.fee}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-200">
                This transaction pays for document verification and permanent storage on IPFS.
              </p>
            </div>

            {/* ── JSON Preview toggle ─────────────────────────────────── */}
            {previewData && (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <FileJson size={15} className="text-[#C19A4A]" />
                    <span>Preview data being uploaded</span>
                  </div>
                  {showPreview
                    ? <ChevronUp size={15} className="text-gray-500" />
                    : <ChevronDown size={15} className="text-gray-500" />
                  }
                </button>

                {showPreview && (
                  <div className="px-4 py-3 bg-[#0d1020] border-t border-white/5">
                    <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">
                      This JSON will be stored permanently on IPFS
                    </p>
                    <pre
                      className="text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-words max-h-56 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: renderSyntaxJson(previewData) }}
                    />
                  </div>
                )}
              </div>
            )}
            {/* ────────────────────────────────────────────────────────── */}
          </div>
        )}

        {/* Buttons */}
        {!isLoading && (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSignTransaction}
              disabled={!connected}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#C19A4A] text-black font-medium hover:bg-[#d4a855] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!connected ? 'Connect Wallet' : 'Sign & Send'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default TransactionSignerModal;