'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// 有效的音乐ID列表
const musicIds = [
  '507795470',
  '1313354324',
  '533259686',
  '408814900',
  '30903117',
  '562594191',
  '25638273',
  '480768067',
  '462523414',
  '464674509',
  '406000625',
  '175072',
  '410801653',
  '28285910'
]

/**
 * 根据音乐ID生成网易云音乐URL
 * @param id 音乐ID
 * @returns 完整的音乐URL
 */
const getMusicUrl = (id: string): string => {
  return `https://music.163.com/song/media/outer/url?id=${id}.mp3`
}

const getRandomTrackIndex = (): number => {
  return Math.floor(Math.random() * musicIds.length)
}

/**
 * 封装浮动按钮的背景音乐播放器：随机曲目、播放/暂停、进度与时长。
 */
export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 更新播放进度
  const updateProgress = useCallback(() => {
    if (!audioRef.current) return
    const currentTime = audioRef.current.currentTime
    const audioDuration = audioRef.current.duration || 0

    setProgress(currentTime)
    setDuration(audioDuration)

    if (audioDuration > 0) {
      const percentage = (currentTime / audioDuration) * 100
      setProgressPercentage(percentage)
    }
  }, [])

  // 播放下一首曲目
  const playNextTrack = useCallback(() => {
    if (!audio) return

    let nextIndex
    do {
      nextIndex = getRandomTrackIndex()
    } while (nextIndex === currentTrackIndex && musicIds.length > 1)

    setCurrentTrackIndex(nextIndex)
    audio.src = getMusicUrl(musicIds[nextIndex])
    audio.load()
    if (!isPlaying) {
      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('播放音乐失败:', error)
          setIsPlaying(false)
        })
      }
    }
  }, [audio, currentTrackIndex, isPlaying])

  // 初始化音频播放器
  useEffect(() => {
    if (audioRef.current) return

    const audioElement = new Audio()
    audioElement.addEventListener('ended', playNextTrack)
    audioElement.addEventListener('timeupdate', updateProgress)
    audioElement.addEventListener('loadedmetadata', () => {
      setDuration(audioElement.duration)
    })
    audioElement.addEventListener('error', (e) => {
      console.error('音频加载错误:', e)
      playNextTrack()
    })

    setAudio(audioElement)
    audioRef.current = audioElement

    const initialTrackIndex = getRandomTrackIndex()
    setCurrentTrackIndex(initialTrackIndex)

    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', playNextTrack)
        audioElement.removeEventListener('timeupdate', updateProgress)
        audioElement.removeEventListener('error', playNextTrack)
        audioElement.pause()
        audioElement.src = ''
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 播放/暂停音乐
  const toggleMusic = useCallback(() => {
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      playNextTrack()
      setIsPlaying(true)
    }
  }, [audio, isPlaying, playNextTrack])

  return {
    isPlaying,
    progress,
    duration,
    progressPercentage,
    toggleMusic
  }
}
