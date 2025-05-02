import { ref } from 'vue';

export function useScrollHelper(router, config) {
    const scrollInterval = ref(null);
    const scrollingContainerHeight = ref('300px');
    const scrollPosition = ref(0);
    const scrollCycleCount = ref(0);
    const containerReady = ref(false);
    const noContentTimeout = ref(null);

    const calculateScrollingContainerHeight = () => {
        scrollingContainerHeight.value = `${window.innerHeight - 265}px`;
    };

    const startScrolling = () => {
        const container = document.getElementById('scrollingContainer');
        
        if (!container) {
            console.error('Scrolling container not found! Trying again...');
            setTimeout(tryStartScrolling, 100);
            return;
        }

        // Clear any existing timeout
        if (noContentTimeout.value) {
            clearTimeout(noContentTimeout.value);
            noContentTimeout.value = null;
        }

        containerReady.value = true;
        scrollPosition.value = 0;
        scrollCycleCount.value = 0;
        clearInterval(scrollInterval.value);

        container.scrollTop = 0;

        const scrollHeight = container.scrollHeight - container.clientHeight;
        if (scrollHeight <= 0) {
            console.log('Not enough content to scroll');
            // Set timeout to switch to match-info after 1-2 minutes if no content
            noContentTimeout.value = setTimeout(() => {
                if (config.value.enableScreenSwitch) {
                    router.push('/match-info');
                }
            }, 60000 + Math.random() * 60000); // Random between 1-2 minutes
            return;
        }

        scrollInterval.value = setInterval(() => {
            scrollPosition.value += 1;
            container.scrollTop = scrollPosition.value;
            
            if (scrollPosition.value >= scrollHeight) {
                scrollPosition.value = 0;
                scrollCycleCount.value += 1;
                container.scrollTop = 0;
                
                if (scrollCycleCount.value >= 2 && config.value.enableScreenSwitch) {
                    stopScrolling();
                    router.push('/match-info');
                }
            }
        }, 100);
    };

    const tryStartScrolling = (attempt = 0) => {
        const maxAttempts = 5;
        const container = document.getElementById('scrollingContainer');
        
        if (container) {
            containerReady.value = true;
            startScrolling();
        } else if (attempt < maxAttempts) {
            setTimeout(() => tryStartScrolling(attempt + 1), 200 * (attempt + 1));
        } else {
            console.error('Failed to find scrolling container after', maxAttempts, 'attempts');
        }
    };

    const stopScrolling = () => {
        clearInterval(scrollInterval.value);
        scrollInterval.value = null;
        if (noContentTimeout.value) {
            clearTimeout(noContentTimeout.value);
            noContentTimeout.value = null;
        }
    };

    return {
        scrollInterval,
        scrollingContainerHeight,
        scrollPosition,
        scrollCycleCount,
        containerReady,
        calculateScrollingContainerHeight,
        startScrolling,
        tryStartScrolling,
        stopScrolling
    };
}