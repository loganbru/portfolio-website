const username = 'loganbru'
const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100`

async function fetchRepos() {
	try {
		const response = await fetch(reposUrl, {
			headers: {
				Accept: 'application/vnd.github.mercy-preview+json', // Needed to access topics
			},
		})
		const repos = await response.json()
		return repos
	} catch (error) {
		console.error('Error fetching repositories:', error)
	}
}

async function fetchPortfolioMetadata(repo) {
	const metadataUrl = `https://raw.githubusercontent.com/${username}/${repo.name.toLowerCase()}/main/portfolio.json`

	try {
		const response = await fetch(metadataUrl)
		if (!response.ok) throw new Error('No portfolio.json found')
		return await response.json()
	} catch (error) {
		return {} // Return empty object if no metadata found
	}
}

function createRepoCard(repo, metadata) {
	const col = document.createElement('div')
	col.className = 'col'

	const card = document.createElement('div')
	card.className = 'card shadow-sm'

	// Thumbnail Image
	const img = document.createElement('img')
	img.className = 'card-img-top'
	img.src = metadata.thumbnailImageLink || 'https://via.placeholder.com/300x200'
	img.alt = 'Project Thumbnail'

	// Card Body
	const cardBody = document.createElement('div')
	cardBody.className = 'card-body'

	// Repo Description
	const description = document.createElement('p')
	description.className = 'card-text'
	description.textContent =
		metadata.portfolioDescription || 'No description available.'

	// Button Group
	const btnGroup = document.createElement('div')
	btnGroup.className = 'btn-group'

	const viewButton = document.createElement('a')
	viewButton.className = 'btn btn-sm btn-outline-secondary'
	viewButton.href = repo.html_url
	viewButton.target = '_blank'
	viewButton.textContent = 'View Repository'

	btnGroup.appendChild(viewButton)

	if (metadata.runLink) {
		const runButton = document.createElement('a')
		runButton.className = 'btn btn-sm btn-outline-secondary'
		runButton.href = metadata.runLink
		runButton.target = '_blank'
		runButton.textContent = 'View on Itch.io'
	
		btnGroup.appendChild(runButton)
	}

	// Footer Section (Fix Button Position)
	const footer = document.createElement('div')
	footer.className =
		'card-footer d-flex justify-content-between align-items-center'

	const smallText = document.createElement('small')
	smallText.className = 'text-body-secondary'
	smallText.textContent =
		'Updated ' + new Date(repo.updated_at).toLocaleDateString()

	footer.appendChild(btnGroup)
	footer.appendChild(smallText)

	// Assemble the card
	cardBody.appendChild(description)
	card.appendChild(img)
	card.appendChild(cardBody)
	card.appendChild(footer)
	col.appendChild(card)

	return col
}

async function displayPortfolioRepos() {
	const repos = await fetchRepos()
	if (!repos) return

	const reposContainer = document.getElementById('repos')

	// Filter repositories with the "portfolio" topic
	const portfolioRepos = repos.filter(
		(repo) => repo.topics && repo.topics.includes('portfolio')
	)

	if (portfolioRepos.length === 0) {
		reposContainer.innerHTML = '<p>No portfolio repositories found.</p>'
		return
	}

	// Fetch metadata for each portfolio repository
	const repoData = await Promise.all(
		portfolioRepos.map(async (repo) => {
			const metadata = await fetchPortfolioMetadata(repo)
			return { repo, metadata }
		})
	)

	// Create and append cards for each portfolio repository
	repoData.forEach(({ repo, metadata }) => {
		const card = createRepoCard(repo, metadata)
		reposContainer.appendChild(card)
	})
}

document.addEventListener('DOMContentLoaded', displayPortfolioRepos)
