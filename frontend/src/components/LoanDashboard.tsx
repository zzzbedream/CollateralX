'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACTS } from '../contracts';

// ⚠️ REEMPLAZA ESTAS DIRECCIONES CON LAS DE TU DEPLOYMENTS.JSON
// Para el hackathon, si no tienes el JSON a mano, pégalas aquí.
const LENDING_POOL_ADDRESS = CONTRACTS.LENDING_POOL;
const NFT_ADDRESS = CONTRACTS.MOCK_NFT;

// ABIs Mínimos (Solo lo que necesitamos para el dashboard)
const LENDING_ABI = [
    { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "depositCollateralAndBorrow", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

const NFT_ABI = [
    { inputs: [{ name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], name: "approve", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

export default function LendingDashboard() {
    const { isConnected } = useAccount();
    const [step, setStep] = useState(0); // 0: Idle, 1: Approving, 2: Valuating (Stylus), 3: Success

    // 1. Escritura: Aprobar NFT
    const { data: hashApprove, writeContract: writeApprove, isPending: isApprovePending } = useWriteContract();
    const { isLoading: isApproving, isSuccess: isApproved } = useWaitForTransactionReceipt({ hash: hashApprove });

    // 2. Escritura: Pedir Préstamo (Llama a Stylus internamente)
    const { data: hashLoan, writeContract: writeLoan, isPending: isLoanPending, error: loanError } = useWriteContract();
    const { isLoading: isLoaning, isSuccess: isLoaned } = useWaitForTransactionReceipt({ hash: hashLoan });

    // Efectos para avanzar pasos visualmente
    useEffect(() => {
        if (isApprovePending || isApproving) setStep(1);
        else if (isApproved && step === 1) setStep(2); // Listo para pedir
        else if (isLoanPending || isLoaning) setStep(3); // "Calculando en Rust..."
        else if (isLoaned) setStep(4); // Éxito
    }, [isApprovePending, isApproving, isApproved, isLoanPending, isLoaning, isLoaned, step]);

    const handleProcess = () => {
        if (step === 0) {
            // Paso 1: Aprobar (Token ID 0 hardcodeado para demo, ajusta si es necesario)
            writeApprove({
                address: NFT_ADDRESS,
                abi: NFT_ABI,
                functionName: 'approve',
                args: [LENDING_POOL_ADDRESS, BigInt(0)]
            });
        } else if (step === 2) {
            // Paso 2: Ejecutar Préstamo
            writeLoan({
                address: LENDING_POOL_ADDRESS,
                abi: LENDING_ABI,
                functionName: 'depositCollateralAndBorrow',
                args: [BigInt(0)]
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="px-4 py-4 flex items-center justify-between bg-white border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">CX</div>
                    <span className="font-bold text-gray-800">ColateralX</span>
                </div>
                <ConnectButton accountStatus="address" showBalance={false} />
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4">
                {!isConnected ? (
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Conecta tu wallet para empezar</h2>
                        <p className="text-gray-500 max-w-xs mx-auto">Accede a liquidez inmediata usando tus activos reales como garantía.</p>
                    </div>
                ) : (
                    <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                        {/* Imagen del Activo */}
                        <div className="h-48 bg-gray-200 relative">
                            <img src="/truck.webp" alt="Maquinaria" className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded font-medium">
                                Activo #000
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 leading-tight">Camión Industrial CAT</h2>
                                    <p className="text-sm text-gray-500">Modelo 2023 • Excelente estado</p>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                    Valuado
                                </span>
                            </div>

                            {/* Simulación de Valoración Stylus (Visual) */}
                            <div className="bg-blue-50 p-4 rounded-xl mb-6 flex justify-between items-center border border-blue-100 shadow-sm">
                                <div>
                                    <p className="text-blue-600 font-medium text-xs uppercase tracking-wide">Valoración Stylus (Rust)</p>
                                    <p className="text-xs text-blue-400">Calculado on-chain</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-blue-900">$20,500</span>
                                    <span className="text-sm text-blue-600 font-medium ml-1">USDC</span>
                                </div>
                            </div>

                            {/* Botón de Acción Principal */}
                            <button
                                onClick={handleProcess}
                                disabled={isApprovePending || isApproving || isLoanPending || isLoaning || step === 4}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-[0.98] ${step === 4
                                        ? 'bg-green-500 text-white shadow-lg cursor-default'
                                        : step === 1 || step === 3
                                            ? 'bg-blue-400 text-white cursor-wait'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                    }`}
                            >
                                {step === 0 && "Iniciar Trámite"}
                                {step === 1 && (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                        Aprobando NFT...
                                    </span>
                                )}
                                {step === 2 && "Solicitar Liquidez ($12,300)"}
                                {step === 3 && (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                        Calculando Riesgo (Stylus)...
                                    </span>
                                )}
                                {step === 4 && "¡Préstamo Recibido!"}
                            </button>

                            {/* Feedback de Error */}
                            {loanError && (
                                <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                                    Error: {loanError.message.slice(0, 100)}...
                                </div>
                            )}

                            {/* Enlace al Explorer */}
                            {hashLoan && (
                                <div className="mt-6 text-center animate-fade-in-up">
                                    <p className="text-xs text-gray-400 mb-1">Transacción confirmada en Arbitrum Sepolia</p>
                                    <a
                                        href={`https://sepolia.arbiscan.io/tx/${hashLoan}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                    >
                                        Ver en Arbiscan ↗
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <footer className="p-4 text-center text-xs text-gray-400">
                CollateralX • Arbitrum Hackathon 2026
            </footer>
        </div>
    );
}
