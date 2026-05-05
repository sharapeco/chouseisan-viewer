const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET",
};

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname !== "/api/csv") {
			return new Response("Not Found", { status: 404 });
		}

		const h = url.searchParams.get("h");
		if (!h) {
			return new Response("Missing required query parameter: h", {
				status: 400,
				headers: CORS_HEADERS,
			});
		}

		const upstream = `https://chouseisan.com/schedule/List/createCsv?h=${encodeURIComponent(h)}&charset=utf-8&row=choice`;

		const upstream_response = await fetch(upstream);

		return new Response(upstream_response.body, {
			status: upstream_response.status,
			headers: {
				...CORS_HEADERS,
				"Content-Type": "text/csv; charset=utf-8",
			},
		});
	},
} satisfies ExportedHandler;
