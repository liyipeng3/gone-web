import {useState} from "react";
import {useRouter} from 'next/router'

interface Item {
    title: string,
    path?: string,
    children?: Item[]
}

interface MenuItem extends Item {
    index: string
}

interface MenuProps {
    data: Item[]
}

export const Menu = ({data, ...props}: MenuProps) => {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState('');
    const menus: MenuItem[] = data.map((item, index) => {
        const temp: MenuItem = item as MenuItem;
        temp.index = String(index + 1);
        temp.children && temp.children.map((childItem, childIndex) => {
            const childTemp: MenuItem = childItem as MenuItem;
            childTemp.index = `${index + 1}-${childIndex + 1}`;
            return childTemp
        })
        return temp;
    })
    return (
        <div className="menu" {...props}>
            {
                menus.map(
                    ({index, title, children = [], path = ""}) => (
                        <div key={index} id={index}>
                            <div onClick={() => {
                                children.length ? setCurrentIndex(index === currentIndex ? '' : index) : router.push(path)
                            }}>{title}</div>
                            <div className={index === currentIndex ? '' : 'hidden'}>
                                {children?.map(({title, path = "/"}, index) => (
                                    <div key={title + index} onClick={() => {
                                        router.push(path).then()
                                    }}>{title}</div>
                                ))}
                            </div>
                        </div>
                    )
                )
            }
        </div>
    )
}
