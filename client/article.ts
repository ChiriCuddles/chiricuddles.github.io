document.querySelectorAll("article")
	.forEach(articleElement => articleElement
		.addEventListener("click", event => !(event.target as Element)?.closest("a, iframe")
			&& articleElement.querySelector<HTMLAnchorElement>("h2 a")?.focus()));
