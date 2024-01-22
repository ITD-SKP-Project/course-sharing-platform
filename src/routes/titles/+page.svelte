<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<main>
	<h1>Project Credits</h1>

	<div class="credits-section">
		<h2>Project Management</h2>
		<ul>
			<li>
				<span class="role">Lead Project Manager:</span><span class="name">Kenni Kollemorten</span>
			</li>
			<li>
				<span class="role">Assistant Project Manager:</span><span class="name"
					>Kenni Kollemorten</span
				>
			</li>
		</ul>
	</div>

	<div class="credits-section">
		<h2>Design Team</h2>
		<ul>
			<li><span class="role">Lead Designer:</span><span class="name">Kenni Kollemorten</span></li>
			<li>
				<span class="role">Graphic Designer:</span><span class="name">Kenni Kollemorten</span>
			</li>
			<li><span class="role">UI/UX Designer:</span><span class="name">Kenni Kollemorten</span></li>
		</ul>
	</div>

	<div class="credits-section">
		<h2>Development Team</h2>
		<ul>
			<li>
				<span class="role">Front-End Developer:</span><span class="name">Kenni Kollemorten</span>
			</li>
			<li>
				<span class="role">Back-End Developer:</span><span class="name">Kenni Kollemorten</span>
			</li>
			<li>
				<span class="role">Full Stack Developer:</span><span class="name">Kenni Kollemorten</span>
			</li>
		</ul>
	</div>

	<div class="credits-section">
		<h2>Content and Marketing</h2>
		<ul>
			<li>
				<span class="role">Content Strategist:</span><span class="name">Kenni Kollemorten</span>
			</li>
			<li><span class="role">Copywriter:</span><span class="name">Kenni Kollemorten</span></li>
			<li><span class="role">SEO Specialist:</span><span class="name">Kenni Kollemorten</span></li>
			<li>
				<span class="role">Social Media Manager:</span><span class="name">Kenni Kollemorten</span>
			</li>
		</ul>
	</div>

	<div class="credits-section">
		<h2>Quality Assurance</h2>
		<ul>
			<li><span class="role">QA Lead:</span><span class="name">Kenni Kollemorten</span></li>
			<li><span class="role">Test Engineer:</span><span class="name">Kenni Kollemorten</span></li>
		</ul>
	</div>

	<div class="credits-section">
		<h2>Special Thanks</h2>
		<p class="special-thanks">
			To coffee and late nights, for making impossible deadlines possible. And a heartfelt thank you
			to all the open source communities and forums for their invaluable resources and support.
		</p>
	</div>

	<div class="credits-section">
		<h2>Dedication</h2>
		<p class="dedication">
			Dedicated to all solo developers and creators out there juggling multiple roles. Your passion,
			dedication, and resilience shine through every challenge. Keep creating, keep innovating.
		</p>
	</div>
</main>

<style>
	main {
		padding: 0 4rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		overflow: hidden;
		transform: translateY(92vh);
		animation: slideIn 20s ease-in forwards;
	}
	@keyframes slideIn {
		to {
			transform: translateY(0);
		}
	}
	.container {
		max-width: 800px;
		margin: auto;
		background: #fff;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}
	h1,
	h2 {
		color: #333;
	}
	ul {
		list-style-type: none;
	}
	li {
		margin-bottom: 10px;
	}
	.credits-section {
		margin-bottom: 40px;
	}
	.credits-section:last-child {
		margin-bottom: 0;
	}
	.role {
		font-weight: bold;
	}
	.name {
		margin-left: 15px;
	}
	.special-thanks,
	.dedication {
		font-style: italic;
	}
</style>
