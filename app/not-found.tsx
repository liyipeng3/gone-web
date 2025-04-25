import Link from 'next/link'

export default function NotFound () {
  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 items-center justify-center h-screen">
      <p className="text-2xl font-bold mb-4 dark:text-white">404 - Not Found</p>
      <p className="text-gray-600 dark:text-gray-300">Sorry, the page you&apos;re looking for doesn&apos;t exist.</p>

      {/* <div className="mt-6"> */}
      {/*   <input */}
      {/*     type="text" */}
      {/*     placeholder="Search for content..." */}
      {/*     className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500" */}
      {/*   /> */}
      {/* </div> */}

      <div className="mt-4 text-center text-lg">
        {/* <p className="text-gray-600 mb-3">Or, you might want to explore:</p> */}
        <Link href="/" className="text-blue-500 dark:text-blue-400 hover:underline">Home</Link>
        {/* <Link href="/blog" className="text-blue-500 hover:underline ml-2">Blog</Link> */}
        {/* <Link href="/contact" className="text-blue-500 hover:underline ml-2">Contact</Link> */}
      </div>
    </div>
  )
}
