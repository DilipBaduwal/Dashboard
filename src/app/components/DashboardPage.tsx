import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Award, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function DashboardPage() {
  const { wdCode } = useParams()
  const navigate = useNavigate()

  const [wdData, setWdData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (wdCode) {
      fetchWDData()
    }
  }, [wdCode])

  const fetchWDData = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('mdp')
      .select('*')
      .eq('WD Code', wdCode)
      .single()

    if (error) {
      console.log(error)
    } else {
      setWdData(data)
    }

    setLoading(false)
  }

  // ============================================
  // SAFE NUMBER
  // ============================================

  const getNumber = (value: any) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 0
    }

    return Number(value)
  }

  // ============================================
  // CFP VOLUME GROWTH
  // ============================================

  const cfpVolumeGrowthRaw =
    (getNumber(wdData?.['CG Volume Growth Score']) /
      100) *
    30

  const cfpVolumeGrowth = Math.min(
    cfpVolumeGrowthRaw,
    30
  ).toFixed(2)

  // ============================================
  // CFP FOCUS PORTFOLIO
  // ============================================

  const cfpFocusPortfolio = getNumber(
    wdData?.['CG Focus Product Score']
  ).toFixed(2)

  // ============================================
  // GR1 EDGE SCORE
  // ============================================

  const gr1Raw =
    (getNumber(wdData?.['GR1 EDGE Score']) /
      100) *
    getNumber(wdData?.['GR1 EDGE Wtg'])

  const gr1Weightage = getNumber(
    wdData?.['GR1 EDGE Wtg']
  )

  // Cannot exceed original weightage
  const gr1Capped = Math.min(
    gr1Raw,
    gr1Weightage
  )

  // Scale to 20 points
  let gr1Scaled = gr1Capped

  // 25 scaled to 20
  if (gr1Weightage === 25) {
    gr1Scaled = gr1Capped * 0.8
  }

  // 15 scaled to 20
  else if (gr1Weightage === 15) {
    gr1Scaled = gr1Capped * 1.33
  }

  // Final cannot exceed 20
  const gr1EdgeCalculated = Math.min(
    gr1Scaled,
    20
  ).toFixed(2)

  // ============================================
  // GR2 EDGE SCORE
  // ============================================

  const gr2Raw =
    (getNumber(wdData?.['GR2 EDGE Score']) /
      100) *
    15

  const gr2EdgeCalculated = Math.min(
    gr2Raw,
    15
  ).toFixed(2)

  // ============================================
  // SWD CHANNEL PERFORMANCE
  // ============================================

  const swdRaw =
    (getNumber(wdData?.['SWD Score']) /
      100) *
    getNumber(wdData?.['SWD Wtg'])

  const swdMax = getNumber(
    wdData?.['SWD Wtg']
  )

  const swdCalculated = Math.min(
    swdRaw,
    swdMax
  ).toFixed(2)

  // ============================================
  // STOCKIST PERFORMANCE
  // ============================================

  let stockistPerformance =
    'Not Included in Parameter'

  if (wdData?.['Stockist Eligible Flag'] === 'Y') {
    const stockistRaw =
      (getNumber(
        wdData?.['Stockist Performance Score']
      ) /
        100) *
      getNumber(
        wdData?.['Stockist Performance Wtg']
      )

    const stockistMax = getNumber(
      wdData?.['Stockist Performance Wtg']
    )

    stockistPerformance = Math.min(
      stockistRaw,
      stockistMax
    ).toFixed(2)
  }

  // ============================================
  // D&D
  // ============================================

  const dndRaw =
  (getNumber(wdData?.['Overall D&D Score']) /
    100) *
  getNumber(wdData?.['D&D Wtg'])

const dndCalculated = Math.min(
  dndRaw,
  getNumber(wdData?.['D&D Wtg'])
).toFixed(2)

  // ============================================
  // OFMCG OFR
  // ============================================

  const ofrRaw =
    (getNumber(wdData?.['OFMCG OFR Score']) /
      100) *
    getNumber(wdData?.['OFMCG OFR Wtg'])

  const ofrMax = getNumber(
    wdData?.['OFMCG OFR Wtg']
  )

  const ofrCalculated = Math.min(
    ofrRaw,
    ofrMax
  ).toFixed(2)

  // ============================================
  // MARKET DEVELOPMENT
  // ============================================

  let marketDevelopment = 'No Weightage'

  if (
    wdData?.['Market Dev Score'] !== null &&
    wdData?.['Market Dev Score'] !== '' &&
    getNumber(wdData?.['Market Dev Score']) !== 0
  ) {
    marketDevelopment = getNumber(
      wdData?.['Market Dev Score']
    ).toFixed(2)
  }

  // ============================================
  // MONEY DROP %
  // ============================================

  const moneyDrop = `${getNumber(
    wdData?.['Money Drop %']
  ).toFixed(2)}%`

  // ============================================
  // FINAL SCORE
  // ============================================

  const finalScore = getNumber(
    wdData?.['Final Score']
  ).toFixed(0)

  // ============================================
  // KPI TABLE
  // ============================================

  const kpiData = [
    {
      area: 'CFP Business',
      parameter: 'CFP Volume Growth',
      value: cfpVolumeGrowth,
    },

    {
      area: 'CFP Business',
      parameter: 'CFP Focus Portfolio',
      value: cfpFocusPortfolio,
    },

    {
      area: 'OFMCG Business',
      parameter: 'GR1 Edge Score',
      value: gr1EdgeCalculated,
    },

    {
      area: 'OFMCG Business',
      parameter: 'GR2 Edge Score',
      value: gr2EdgeCalculated,
    },

    {
      area: 'OFMCG Business',
      parameter: 'SWD Channel Performance',
      value: swdCalculated,
    },

    {
      area: 'OFMCG Business',
      parameter: 'Stockist Performance',
      value: stockistPerformance,
    },

    {
      area: 'Cost Efficiency',
      parameter: 'D&D',
      value: dndCalculated,
    },

    {
      area: 'Business Systems',
      parameter: 'OFMCG OFR',
      value: ofrCalculated,
    },

    {
      area: 'Business Systems',
      parameter: 'Market Development',
      value: marketDevelopment,
    },
  ]

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-[#0B1F4D] text-xl font-bold">
          Loading Dashboard...
        </div>
      </div>
    )
  }

  // ============================================
  // UI
  // ============================================

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#0B1F4D] via-[#1F4E79] to-[#0B1F4D] px-6 pt-12 pb-8 rounded-b-3xl shadow-2xl">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate('/mdp')}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />

          <span className="text-sm font-medium">
            Back to Leaderboard
          </span>
        </button>

        {/* PROFILE CARD */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl">
          <div className="flex justify-between items-start">
            {/* LEFT */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                {wdData?.['WD Name']}
              </h2>

              <p className="text-[#00C2FF] text-sm font-medium mt-1">
                {wdData?.['WD Code']}
              </p>

              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                  Band {wdData?.['Band']}
                </span>

                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                  {wdData?.['Fiscal Qtr']} FY
                  {wdData?.['Fiscal Year']}
                </span>
              </div>
            </div>

            {/* SCORE */}
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="6"
                    fill="none"
                  />

                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="#00C2FF"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${
                      2 * Math.PI * 32
                    }`}
                    strokeDashoffset={`${
                      2 *
                      Math.PI *
                      32 *
                      (1 -
                        Number(finalScore) / 100)
                    }`}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {finalScore}
                  </span>
                </div>
              </div>

              <p className="text-white/80 text-xs mt-2 font-medium">
                Overall Score
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MONEY DROP BOX */}
      <div className="px-6 mt-6">
        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
          <div className="text-sm text-gray-500 font-medium">
            Money Drop %
          </div>

          <div className="text-4xl font-bold text-[#0B1F4D] mt-2">
            {moneyDrop}
          </div>
        </div>
      </div>

      {/* KPI TABLE */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#0B1F4D] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#00C2FF]" />
            Performance Metrics
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* HEADER */}
          <div className="grid grid-cols-2 gap-2 px-4 py-3 bg-gradient-to-r from-[#1F4E79] to-[#0B1F4D] text-white text-xs font-semibold">
            <div>Parameter</div>

            <div className="text-right">Value</div>
          </div>

          {/* BODY */}
          <div className="divide-y divide-gray-100">
            {kpiData.map((kpi, idx) => (
              <div key={idx}>
                {(idx === 0 ||
                  kpiData[idx - 1].area !==
                    kpi.area) && (
                  <div className="px-4 py-2 bg-gray-50">
                    <h4 className="text-xs font-bold text-[#1F4E79] uppercase tracking-wide">
                      {kpi.area}
                    </h4>
                  </div>
                )}

                {/* ROW */}
                <div
                  onClick={() =>
                    navigate(
                      `/kpi/${wdCode}/${kpi.parameter.replace(
                        /\s+/g,
                        '-'
                      )}`
                    )
                  }
                  className="grid grid-cols-2 gap-2 px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="text-sm text-[#0B1F4D] font-medium">
                    {kpi.parameter}
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[#00C2FF] font-semibold text-lg group-hover:underline">
                      {kpi.value}

                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}