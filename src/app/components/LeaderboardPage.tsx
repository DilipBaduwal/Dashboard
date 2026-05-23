import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Search,
  Bell,
  Trophy,
  ChevronRight,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react'

import { supabase } from '../../lib/supabase'

interface WDPerformer {
  rank: number
  wdName: string
  wdCode: string
  score: number
  band: string
  fiscalYear: string
  fiscalQtr: string
}

export default function LeaderboardPage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)

  const [data, setData] = useState<WDPerformer[]>([])

  const [searchTerm, setSearchTerm] = useState('')

  const [selectedFY, setSelectedFY] = useState('All')
  const [selectedQuarter, setSelectedQuarter] = useState('All')
  const [selectedBand, setSelectedBand] = useState('All')
  const [selectedWD, setSelectedWD] = useState('All')

  const [fyOptions, setFyOptions] = useState<string[]>([])
  const [quarterOptions, setQuarterOptions] = useState<string[]>([])
  const [bandOptions, setBandOptions] = useState<string[]>([])
  const [wdOptions, setWdOptions] = useState<string[]>([])

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    setLoading(true)

    const { data: mdpData, error } = await supabase
      .from('mdp')
      .select(`
        "WD Name",
        "WD Code",
        "Band",
        "Fiscal Year",
        "Fiscal Qtr",
        "Final Score"
      `)
      .order('Final Score', { ascending: false })

    if (error) {
      console.log(error)
      setLoading(false)
      return
    }

    const formattedData: WDPerformer[] =
      mdpData?.map((item: any, index: number) => ({
        rank: index + 1,
        wdName: item['WD Name'],
        wdCode: item['WD Code'],
        score: item['Final Score'],
        band: item['Band'],
        fiscalYear: item['Fiscal Year'],
        fiscalQtr: item['Fiscal Qtr'],
      })) || []

    setData(formattedData)

    setFyOptions([
      'All',
      ...new Set(
        formattedData.map((item) => item.fiscalYear)
      ),
    ])

    setQuarterOptions([
      'All',
      ...new Set(
        formattedData.map((item) => item.fiscalQtr)
      ),
    ])

    setBandOptions([
      'All',
      ...new Set(
        formattedData.map((item) => item.band)
      ),
    ])

    setWdOptions([
      'All',
      ...new Set(
        formattedData.map((item) => item.wdCode)
      ),
    ])

    setLoading(false)
  }

  const filteredData = data.filter((performer) => {
    const matchesSearch =
      performer.wdName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      performer.wdCode
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())

    const matchesFY =
      selectedFY === 'All' ||
      performer.fiscalYear === selectedFY

    const matchesQuarter =
      selectedQuarter === 'All' ||
      performer.fiscalQtr === selectedQuarter

    const matchesBand =
      selectedBand === 'All' ||
      performer.band === selectedBand

    const matchesWD =
      selectedWD === 'All' ||
      performer.wdCode === selectedWD

    return (
      matchesSearch &&
      matchesFY &&
      matchesQuarter &&
      matchesBand &&
      matchesWD
    )
  })

  const isSingleWDView =
    searchTerm.trim() !== '' ||
    selectedWD !== 'All'

  const handleWDClick = (wdCode: string) => {
    navigate(`/dashboard/${wdCode}`)
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 via-amber-400 to-yellow-600'

      case 2:
        return 'from-gray-300 via-slate-300 to-gray-400'

      case 3:
        return 'from-orange-400 via-amber-600 to-orange-700'

      default:
        return 'from-[#1F4E79] to-[#0B1F4D]'
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return (
        <Trophy className="w-8 h-8 text-white drop-shadow-lg" />
      )
    }

    return (
      <span className="text-2xl font-bold text-white">
        {rank}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#0B1F4D] via-[#1F4E79] to-[#0B1F4D] px-6 pt-12 pb-8 rounded-b-3xl shadow-2xl">

        <button
          onClick={() => navigate('/variants')}
          className="flex items-center gap-2 text-white/90 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />

          <span className="text-sm font-medium">
            Back
          </span>
        </button>

        <div className="flex justify-between items-start mb-6">

          <div>
            <h1 className="text-4xl font-bold text-white">
              MDP
            </h1>

            <p className="text-[#00C2FF] text-sm mt-1">
              Market Development Program
            </p>
          </div>

          <div className="flex gap-3">

            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </button>

          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            type="text"
            placeholder="Search WD Name or WD Code"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-white/30 focus:outline-none text-[#0B1F4D]"
          />

        </div>
      </div>

      {/* FILTERS */}
      <div className="px-6 mt-6">

        <div className="grid grid-cols-2 gap-4">

          {/* Fiscal Year */}
          <div>

            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Fiscal Year
            </label>

            <select
              value={selectedFY}
              onChange={(e) =>
                setSelectedFY(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl bg-white shadow border"
            >
              {fyOptions.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>

          </div>

          {/* Fiscal Quarter */}
          <div>

            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Fiscal Quarter
            </label>

            <select
              value={selectedQuarter}
              onChange={(e) =>
                setSelectedQuarter(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl bg-white shadow border"
            >
              {quarterOptions.map((qtr) => (
                <option key={qtr} value={qtr}>
                  {qtr}
                </option>
              ))}
            </select>

          </div>

          {/* Band */}
          <div>

            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Band
            </label>

            <select
              value={selectedBand}
              onChange={(e) =>
                setSelectedBand(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl bg-white shadow border"
            >
              {bandOptions.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>

          </div>

          {/* WD Code */}
          <div>

            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              WD Code
            </label>

            <select
              value={selectedWD}
              onChange={(e) =>
                setSelectedWD(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl bg-white shadow border"
            >
              {wdOptions.map((wd) => (
                <option key={wd} value={wd}>
                  {wd}
                </option>
              ))}
            </select>

          </div>

        </div>
      </div>

      {/* TITLE */}
      {!isSingleWDView && (
        <div className="px-6 mt-8 mb-4">

          <h2 className="text-xl font-bold text-[#0B1F4D] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#00C2FF]" />
            Top Performers
          </h2>

        </div>
      )}

      {loading ? (
        <div className="text-center mt-20 text-gray-500">
          Loading leaderboard...
        </div>
      ) : (
        <>
          {/* TOP 3 */}
          {!isSingleWDView && (
            <div className="px-6 space-y-4 mb-6">

              {filteredData.slice(0, 3).map((performer) => (

                <div
                  key={performer.rank}
                  onClick={() =>
                    handleWDClick(performer.wdCode)
                  }
                  className={`bg-gradient-to-r ${getRankColor(
                    performer.rank
                  )} rounded-2xl p-5 shadow-2xl cursor-pointer`}
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">

                      <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                        {getRankIcon(performer.rank)}
                      </div>

                      <div>

                        <h3 className="text-white font-bold text-lg">
                          {performer.wdName}
                        </h3>

                        <p className="text-white/80 text-sm">
                          {performer.wdCode}
                        </p>

                        <p className="text-white/70 text-xs">
                          Band {performer.band}
                        </p>

                      </div>
                    </div>

                    <div className="text-right">

                      <div className="text-3xl font-bold text-white">
                        {performer.score}
                      </div>

                      <div className="text-white/80 text-xs">
                        Final Score
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ALL RANKINGS */}
          <div className="px-6 space-y-3">

            {!isSingleWDView && (
              <h3 className="text-lg font-semibold text-[#0B1F4D]">
                All Rankings
              </h3>
            )}

            {(isSingleWDView
              ? filteredData
              : filteredData.slice(3)
            ).map((performer) => (

              <div
                key={performer.rank}
                onClick={() =>
                  handleWDClick(performer.wdCode)
                }
                className="bg-white rounded-xl p-4 shadow-md cursor-pointer"
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1F4E79] to-[#0B1F4D] flex items-center justify-center">

                      <span className="text-white font-bold">
                        {performer.rank}
                      </span>

                    </div>

                    <div>

                      <h4 className="font-semibold text-[#0B1F4D]">
                        {performer.wdName}
                      </h4>

                      <p className="text-gray-500 text-sm">
                        {performer.wdCode}
                      </p>

                    </div>
                  </div>

                  <div className="flex items-center gap-3">

                    <div className="text-right">

                      <div className="text-xl font-bold text-[#1F4E79]">
                        {performer.score}
                      </div>

                      <div className="text-gray-400 text-xs">
                        Final Score
                      </div>

                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400" />

                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}