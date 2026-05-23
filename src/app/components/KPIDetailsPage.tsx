import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface CalculationMetric {
  name: string
  actual: number | string
  target: number | string
  achievement: number | string
  weightage: number | string
  contribution: number | string
}

export default function KPIDetailsPage() {
  const { wdCode, kpiName } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [wdData, setWdData] = useState<any>(null)

  const [calculationMetrics, setCalculationMetrics] =
    useState<CalculationMetric[]>([])

  useEffect(() => {
    fetchData()
  }, [wdCode])

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

  const fetchData = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('mdp')
      .select('*')
      .eq('WD Code', wdCode)
      .single()

    if (error) {
      console.log(error)
      setLoading(false)
      return
    }

    setWdData(data)

    // ============================================
    // CFP VOLUME GROWTH
    // ============================================

    const cfpVolumeContribution = Math.min(
      (getNumber(data?.['CG Volume Growth Score']) /
        100) *
        30,
      30
    ).toFixed(2)

    const cfpVolumeAchievement = Math.min(
      getNumber(data?.['CG Volume Growth Score']),
      100
    ).toFixed(2)

    // ============================================
    // CFP FOCUS PORTFOLIO
    // ============================================

    const cfpFocusAchievement =
      (
        (getNumber(
          data?.['CG Focus Product Achievement']
        ) /
          getNumber(
            data?.['CG Focus Product Target']
          )) *
        100
      ).toFixed(2)

    // ============================================
    // GR1 EDGE
    // ============================================

    const gr1Raw =
      (getNumber(data?.['GR1 EDGE Score']) /
        100) *
      getNumber(data?.['GR1 EDGE Wtg'])

    const gr1Limited = Math.min(
      gr1Raw,
      getNumber(data?.['GR1 EDGE Wtg'])
    )

    let gr1Scaled = gr1Limited

    if (
      getNumber(data?.['GR1 EDGE Wtg']) === 25
    ) {
      gr1Scaled = gr1Limited * 0.8
    }

    if (
      getNumber(data?.['GR1 EDGE Wtg']) === 15
    ) {
      gr1Scaled = gr1Limited * 1.33
    }

    gr1Scaled = Math.min(gr1Scaled, 20)

    // ============================================
    // GR2 EDGE
    // ============================================

    const gr2Raw =
      (getNumber(data?.['GR2 EDGE Score']) /
        100) *
      15

    const gr2Contribution = Math.min(
      gr2Raw,
      15
    ).toFixed(2)

    // ============================================
    // SWD
    // ============================================

    const swdContribution = Math.min(
      (getNumber(data?.['SWD Score']) /
        100) *
        getNumber(data?.['SWD Wtg']),
      getNumber(data?.['SWD Wtg'])
    ).toFixed(2)

    // ============================================
    // STOCKIST
    // ============================================

    let stockistContribution = 'Not Included'

    if (
      data?.['Stockist Eligible Flag'] === 'Y'
    ) {
      stockistContribution = Math.min(
        (getNumber(
          data?.['Stockist Performance Score']
        ) /
          100) *
          getNumber(
            data?.['Stockist Performance Wtg']
          ),
        getNumber(
          data?.['Stockist Performance Wtg']
        )
      ).toFixed(2)
    }

    // ============================================
    // D&D
    // ============================================

    const dndContribution = Math.min(
  (getNumber(data?.['Overall D&D Score']) /
    100) *
    getNumber(data?.['D&D Wtg']),
  getNumber(data?.['D&D Wtg'])
).toFixed(2)

    // ============================================
    // OFR
    // ============================================

    const ofrContribution = Math.min(
      (getNumber(data?.['OFMCG OFR Score']) /
        100) *
        getNumber(data?.['OFMCG OFR Wtg']),
      getNumber(data?.['OFMCG OFR Wtg'])
    ).toFixed(2)

    // ============================================
    // MARKET DEVELOPMENT
    // ============================================

    let marketDevelopmentContribution =
      'No Weightage'

    if (
      getNumber(data?.['Market Dev Score']) > 0
    ) {
      marketDevelopmentContribution =
        getNumber(
          data?.['Market Dev Score']
        ).toFixed(2)
    }

    // ============================================
    // KPI TABLE
    // ============================================

    const metrics: CalculationMetric[] = [
      {
        name: 'CFP Volume Growth',

        actual: `
CG Vol Growth : ${getNumber(
          data?.['CG Vol Growth']
        ).toFixed(2)}

CG Volume Growth for Circle : ${getNumber(
          data?.['CG Volume Growth for Circle']
        ).toFixed(2)}
`,

        target: '-',

        achievement: cfpVolumeAchievement,

        weightage: '30',

        contribution: cfpVolumeContribution,
      },

      {
        name: 'CFP Focus Portfolio',

        actual: `
CG Focus Product Achievement : ${getNumber(
          data?.['CG Focus Product Achievement']
        ).toFixed(2)}
`,

        target: `
CG Focus Product Target : ${getNumber(
          data?.['CG Focus Product Target']
        ).toFixed(2)}
`,

        achievement: cfpFocusAchievement,

        weightage: getNumber(
          data?.['CG Focus Product Wtg']
        ).toFixed(2),

        contribution: getNumber(
          data?.['CG Focus Product Score']
        ).toFixed(2),
      },

      {
        name: 'GR1 Edge Score',

        actual: getNumber(
          data?.['GR1 EDGE Score']
        ).toFixed(2),

        target: '20',

        achievement: getNumber(
          data?.['GR1 EDGE Score']
        ).toFixed(2),

        weightage: getNumber(
          data?.['GR1 EDGE Wtg']
        ).toFixed(2),

        contribution: gr1Scaled.toFixed(2),
      },

      {
        name: 'GR2 Edge Score',

        actual: getNumber(
          data?.['GR2 EDGE Score']
        ).toFixed(2),

        target: '100',

        achievement: getNumber(
          data?.['GR2 EDGE Score']
        ).toFixed(2),

        weightage: '15',

        contribution: gr2Contribution,
      },

      {
  name: 'SWD Channel Performance',

  actual: getNumber(
    data?.['SWD Score']
  ).toFixed(2),

  target: '100',

  achievement: getNumber(
    data?.['SWD Score']
  ).toFixed(2),

  weightage: getNumber(
    data?.['SWD Wtg']
  ).toFixed(2),

  contribution: swdContribution,
},

      {
        name: 'Stockist Performance',

        actual:
          data?.['Stockist Eligible Flag'] ===
          'Y'
            ? getNumber(
                data?.[
                  'Stockist Performance Score'
                ]
              ).toFixed(2)
            : 'Not Included',

        target:
          data?.['Stockist Eligible Flag'] ===
          'Y'
            ? getNumber(
                data?.[
                  'Stockist Performance Wtg'
                ]
              ).toFixed(2)
            : 'Not Included',

        achievement:
          data?.['Stockist Eligible Flag'] ===
          'Y'
            ? getNumber(
                data?.[
                  'Stockist Performance Score'
                ]
              ).toFixed(2)
            : '0',

        weightage:
          data?.['Stockist Eligible Flag'] ===
          'Y'
            ? getNumber(
                data?.[
                  'Stockist Performance Wtg'
                ]
              ).toFixed(2)
            : 'Not Included',

        contribution: stockistContribution,
      },

      {
  name: 'D&D',

  actual: `
D&D Score GR1 : ${getNumber(
    data?.['D&D Score GR1']
  ).toFixed(2)}

D&D Score GR2 : ${getNumber(
    data?.['D&D Score GR2']
  ).toFixed(2)}

D&D Score CG : ${getNumber(
    data?.['D&D Score CG']
  ).toFixed(2)}

Overall D&D Score : ${getNumber(
    data?.['Overall D&D Score']
  ).toFixed(2)}
`,

  target: '-',

  achievement: getNumber(
  data?.['Overall D&D Score']
).toFixed(2),

  weightage: getNumber(
    data?.['D&D Wtg']
  ).toFixed(2),

  contribution: dndContribution,
},

      {
        name: 'OFMCG OFR',

        actual: getNumber(
          data?.['OFMCG OFR Score']
        ).toFixed(2),

        target: getNumber(
          data?.['OFMCG OFR Wtg']
        ).toFixed(2),

        achievement: getNumber(
          data?.['OFMCG OFR Score']
        ).toFixed(2),

        weightage: getNumber(
          data?.['OFMCG OFR Wtg']
        ).toFixed(2),

        contribution: ofrContribution,
      },

      {
        name: 'Market Development',

        actual: getNumber(
          data?.['Market Dev Score']
        ).toFixed(2),

        target: '-',

        achievement: getNumber(
          data?.['Market Dev Score']
        ).toFixed(2),

        weightage: getNumber(
          data?.['Market Dev Wtg']
        ).toFixed(2),

        contribution:
          marketDevelopmentContribution,
      },
    ]

    setCalculationMetrics(metrics)

    setLoading(false)
  }

  const displayName =
    kpiName?.replace(/-/g, ' ') ||
    'KPI Details'

  const selectedMetric =
    calculationMetrics.find(
      (metric) =>
        metric.name.toLowerCase() ===
        displayName.toLowerCase()
    ) || calculationMetrics[0]

  const finalScore = Number(
    selectedMetric?.contribution || 0
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0B1F4D] via-[#1F4E79] to-[#0B1F4D] px-6 pt-12 pb-8 rounded-b-3xl shadow-2xl">
        <button
          onClick={() =>
            navigate(`/dashboard/${wdCode}`)
          }
          className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />

          <span className="text-sm font-medium">
            Back to Dashboard
          </span>
        </button>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-1">
            {displayName}
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-[#00C2FF] text-sm font-medium">
              {wdCode}
            </span>

            <span className="text-white/60 text-sm">
              •
            </span>

            <span className="text-white/80 text-sm">
              {wdData?.['Fiscal Qtr']}{' '}
              {wdData?.['Fiscal Year']}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold text-white">
                {finalScore}
              </div>

              <div className="text-white/80 text-sm mt-1">
                Current Score
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Breakdown */}
      <div className="px-6 mt-6">
        <h3 className="text-lg font-bold text-[#0B1F4D] mb-1">
          MDP Calculation Breakdown
        </h3>

        <p className="text-sm text-gray-500">
          Performance score contributors and
          weightage
        </p>
      </div>

      {/* Single KPI Card */}
      <div className="px-6 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <h4 className="text-sm font-bold text-[#0B1F4D] mb-4 leading-tight">
            {selectedMetric.name}
          </h4>

          {/* Values */}
          {/* Values */}
<div className="space-y-4 mb-3">
  {/* ACTUAL */}
  <div>
    <div className="text-xs text-gray-500 mb-2">
      Actual
    </div>

    <div className="bg-[#F8FAFC] rounded-xl p-3 border border-gray-100">
      <div className="text-sm font-semibold text-[#1F4E79] whitespace-pre-line leading-8">
        {selectedMetric.actual || '-'}
      </div>
    </div>
  </div>

  {/* TARGET */}
  <div>
    <div className="text-xs text-gray-500 mb-2">
      Target
    </div>

    <div className="bg-[#F8FAFC] rounded-xl p-3 border border-gray-100">
      <div className="text-sm font-medium text-gray-700 whitespace-pre-line leading-7">
        {selectedMetric.target || '-'}
      </div>
    </div>
  </div>
</div>

          {/* Achievement */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">
                Achievement
              </span>

              <span className="text-xs font-bold text-[#00C853]">
                {selectedMetric.achievement ||
                  0}
                %
              </span>
            </div>

            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00C853] to-[#00C2FF] rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    Number(
                      selectedMetric.achievement
                    ) || 0,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Weightage */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">
                Weightage
              </span>

              <span className="text-xs font-semibold text-[#1F4E79]">
                {selectedMetric.weightage ||
                  '-'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Contribution
              </span>

              <span className="text-sm font-bold text-[#00C2FF]">
                {selectedMetric.contribution ||
                  '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}