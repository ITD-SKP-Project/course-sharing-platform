<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import { Button } from '$lib/components/ui/button';
</script>

<div class="flex h-screen-fix lg:!bg-none" id="theme-image">
	<!-- <img src={future} alt="city" class="hidden w-1/2 max-w-[60rem] object-cover lg:block" /> -->
	<div
		data-flip-id="theme-image"
		id="theme-image"
		class="relative z-10 hidden w-1/2 max-w-[60rem] object-cover lg:block"
	></div>
	<div
		data-flip-id="login-form"
		id="login-form"
		class="relative z-0 flex w-full flex-col items-center justify-center gap-4 backdrop-blur-3xl lg:w-1/2"
	>
		<div class="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-background p-8">
			<h1 class="text-4xl font-bold">Din adgangkode er blevet ændret.</h1>

			<Button href="/login" class="mx-auto w-full max-w-md">Gå til login</Button>
		</div>
	</div>
</div>
