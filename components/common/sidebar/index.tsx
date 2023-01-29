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
         className={cn('w-72 sticky h-fit py-4', sticky ? 'bottom-0 self-end' : 'top-0 self-start')}>
      <div className="sidebar__header">
        <div className="sidebar__header__title">Sidebar</div>
      </div>
      <div className="sidebar__content">
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 3</div>
        <div className="sidebar__content__item">Item 4</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 3</div>
        <div className="sidebar__content__item">Item 4</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 3</div>
        <div className="sidebar__content__item">Item 4</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 3</div>
        <div className="sidebar__content__item">Item 4</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 3</div>
        <div className="sidebar__content__item">Item 4</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 3</div>
        <div className="sidebar__content__item">Item 4</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 1</div>
        <div className="sidebar__content__item">Item 2</div>
        <div className="sidebar__content__item">Item 3</div>
        <div className="sidebar__content__item">Item 4</div>
        <div className="sidebar__content__item">Item 1</div>
      </div>
    </div>
  )
}

export default Sidebar
