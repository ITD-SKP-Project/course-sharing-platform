<script>
	import { Separator } from '$lib/components/ui/separator';
	// import { Github } from 'lucide-svelte';
	import { Face, GithubLogo, LinkedinLogo, Globe } from 'radix-icons-svelte';
	import { Mail, Facebook } from 'lucide-svelte';

	import * as Avatar from '$lib/components/ui/avatar';
</script>

<footer class="flex w-full flex-wrap justify-around bg-secondary py-16">
	<div class="w-1/4 min-w-40">
		<h3 class="mb-4 font-bold leading-tight">Udviklet af <br />Kenni Kollemorten</h3>
		<Separator class="my-4" />

		<p class="font-bold"></p>
		<a
			class=" font-medium text-foreground/60"
			href="mailto:kenn7575@edu.sde.dk?subject=Support - opgavebank">Support email</a
		>
		<div class="mt-2">
			<ul class="flex gap-3 text-foreground/60">
				<li>
					<a target="_blank" href="https://github.com/kenn7575">
						<GithubLogo class="h-6 w-6" />
					</a>
				</li>
				<li>
					<a target="_blank" href="https://www.linkedin.com/in/kenni-kollemorten/">
						<LinkedinLogo class="h-6 w-6" /></a
					>
				</li>
			</ul>
		</div>
	</div>
	<div class="w-1/4 min-w-40">
		<h3 class="font-bold">Sider</h3>
		<Separator class="my-4" />
		<ul class="flex flex-col gap-2 text-foreground/60">
			<li><a href="/">Hjem</a></li>
			<li><a href="/login">Log ind</a></li>
			<li><a href="/signup">Opret dig</a></li>
			<li><a href="/konto">Din konto</a></li>
		</ul>
	</div>
	<div class="w-1/4 min-w-40">
		<h3 class="font-bold">Industriens uddannelser</h3>
		<Separator class="w- my-4" />
		<ul class="flex gap-3 text-foreground/60">
			<li>
				<a target="_blank" href="https://iu.dk/">
					<Globe class="h-6 w-6" />
				</a>
			</li>
			<li>
				<a target="_blank" href="https://www.linkedin.com/company/industriens-uddannelser/">
					<LinkedinLogo class="h-6 w-6" /></a
				>
			</li>
			<li>
				<a target="_blank" href="https://www.facebook.com/IndustriensUdd">
					<Facebook class="h-6 w-6" />
				</a>
			</li>
		</ul>
	</div>
</footer>
