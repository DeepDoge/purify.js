import { computed, fragment, ref, tags } from "purify-js";

const { button, p, span } = tags;

const TRAFFIC_LIGHTS = ["red", "orange", "green"] as const;
export function TrafficsLight() {
	const lightIndex = ref(0);

	const light = computed(
		() => TRAFFIC_LIGHTS[lightIndex.val],
	);

	function nextLight() {
		lightIndex.val =
			(lightIndex.val + 1) % TRAFFIC_LIGHTS.length;
	}

	return fragment(
		button().onclick(nextLight).children("Next light"),
		p().children("Light is: ", light),
		p().children(
			"You must",
			computed(() => {
				if (light.val === "red") {
					return span().children("STOP");
				} else if (light.val === "orange") {
					return span().children("SLOW DOWN");
				} else if (light.val === "green") {
					return span().children("GO");
				}
				light.val satisfies never;
				throw new Error(
					`Unhandled light: ${light.val}`,
				);
			}),
		),
	);
}
