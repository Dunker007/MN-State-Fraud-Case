export default function WhistleblowerFeed() {
    const highlights = [
        { date: "Jan 2, 2026", text: "480+ DHS staff warned about fraud years ago — receipts ignored.", link: "https://twitter.com/Minnesota_DHS" },
        { date: "Dec 31, 2025", text: "$250M+ diverted while oversight slept. The chain exposed.", link: "https://twitter.com/Minnesota_DHS" },
        { date: "Dec 30, 2025", text: "The audit trail doesn't lie: emails show direct knowledge.", link: "https://twitter.com/Minnesota_DHS" },
        { date: "Dec 28, 2025", text: "Why did the 'stop payment' order get cancelled? We have the logs.", link: "https://twitter.com/Minnesota_DHS" },
        { date: "Dec 24, 2025", text: "Merry Christmas? Not for the taxpayers of Minnesota.", link: "https://twitter.com/Minnesota_DHS" },
        { date: "Dec 20, 2025", text: "New documents released: See the internal memos.", link: "https://twitter.com/Minnesota_DHS" }
    ];

    return (
        <div className="flex-1 overflow-y-auto rounded-lg border border-cyan-500/30 p-4 h-full">
            <h3 className="text-lg font-bold text-white mb-4">480 Whistleblowers Highlights</h3>
            <div className="space-y-4">
                {highlights.map((post, i) => (
                    <div key={i} className="bg-black/50 rounded-lg p-4 border border-gray-800 hover:border-cyan-500/30 transition-colors">
                        <p className="text-sm text-gray-400 mb-2">{post.date}</p>
                        <p className="text-white">{post.text}</p>
                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-sm hover:underline mt-2 inline-block">
                            Read full post →
                        </a>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-6 text-center">
                Full live feed: <a href="https://twitter.com/Minnesota_DHS" className="text-cyan-400 hover:underline">@Minnesota_DHS</a> (log in to X for real-time view)
            </p>
        </div>
    );
}
