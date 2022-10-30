import Link from "next/link";
import {wrapper} from "@/store";

export default function AboutScreen() {
    return (
        <div>
            <div>about</div>
            <Link href="/">index</Link>
        </div>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    () =>
        async () => {
            return {props: {}};
        }
);

