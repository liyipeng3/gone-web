import { useEffect, useState } from 'react'
import cn from 'classnames'

const Sidebar = () => {
  const [sticky, setSticky] = useState(false)
  useEffect(() => {
    const sidebar = document.getElementById('sidebar') ?? { clientHeight: 0 }
    if (sidebar.clientHeight < document.documentElement.clientHeight) {
      setSticky(false)
    } else {
      setSticky(true)
    }
  }, [])
  return (
    <div id="sidebar"
         className={cn('w-72 sticky h-fit py-4 md:block hidden', sticky ? 'bottom-0 self-end' : 'top-0 self-start')}>
      <div className="">
        <div className="">Sidebar</div>
      </div>
      <div className="">
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 3</div>
        <div className="">Item 4</div>
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 3</div>
        <div className="">Item 4</div>
        <div className="">Item 1</div>
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 3</div>
        <div className="">Item 4</div>
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 3</div>
        <div className="">Item 4</div>
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 3</div>
        <div className="">Item 4</div>
        <div className="">Item 1</div>
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 3</div>
        <div className="">Item 4</div>
        <div className="">Item 1</div>
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 1</div>
        <div className="">Item 2</div>
        <div className="">Item 3</div>
        <div className="">Item 4</div>
        <div className="">Item 1</div>
      </div>
    </div>
  )
}

export default Sidebar
