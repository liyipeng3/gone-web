import dayjs from 'dayjs'
import React from 'react'
import duration from 'dayjs/plugin/duration'
import { AiOutlineGithub } from 'react-icons/ai'
import { getDurationTime } from '@utils'

dayjs.extend(duration)

interface FooterProps {
  logo?: string
}

const now = dayjs()

export const Footer: React.FC<FooterProps> = ({ logo = '' }) => {
  const visitTimes = 123
  const establishTime = dayjs('2019-03-27 00:00:00')

  return (
        <footer className='dark:bg-dark-light  dark:border-t-dark-line border-t border-solid'>
            <span>{logo}</span>
            <div className='text-xs text-gray-400 select-none'>
                <div>Copyright &copy; 2018-{now.year()} <span className='text-gray-600 dark:text-gray-300'>小明难亡</span> All Rights Reserved</div>
                <div className='mt-1'>本站总访问量 {visitTimes} 次 | 运行时间: {getDurationTime(establishTime)} | <a
                    className='hover:text-gray-600 transition-colors dark:hover:text-gray-300' rel='noreferrer' href='https://beian.miit.gov.cn'
                    target='_blank'>黑ICP备18007630号-2</a></div>
            </div>
            <div className='flex flex-row'>
                <AiOutlineGithub className="github hover:text-black dark:hover:text-white transition-all"
                                 onClick={() => window.open('https://github.com/liyipeng123', '_blank')}/>
            </div>
        </footer>
  )
}
