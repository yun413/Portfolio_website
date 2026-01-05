gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", () => {
    ScrollTrigger.refresh();
});

document.addEventListener("DOMContentLoaded", function() {
    


    // --- 2. 視差動畫修正 (增加響應式邏輯) ---
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
        // 【電腦版】維持你原本的 ScrollTrigger 邏輯
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#parallax-container",
                start: "top top",
                end: "+=1500",
                scrub: 1,
                pin: true,
                invalidateOnRefresh: true 
            }
        });

        gsap.set("#layer-bird", { y: -800 });
        gsap.set("#layer-bear", { x: 800 });
        gsap.set("#layer-fox",  { y: 800 });

        tl.to("#layer-sky", { scale: 1.2, duration: 2 }, 0)
        .to("#layer-star", { opacity: 0.5, y: -100, duration: 2 }, 0)
        .to("#layer-bird", { y: 0, duration: 2 }, 0.2)
        .to("#layer-bear", { x: 0, duration: 2 }, 0.4)
        .to("#layer-fox",  { y: 0, duration: 2 }, 0.6)
        .to("#text-overlay h1", { opacity: 1, scale: 1, duration: 1.5 }, 0.8);
    });

    mm.add("(max-width: 767px)", () => {
        // 【手機版】自動播放動畫，不使用 ScrollTrigger Pin
        const tlMobile = gsap.timeline();

        gsap.set("#layer-bird", { y: -200 }); // 手機位移距離縮短
        gsap.set("#layer-bear", { x: 200 });
        gsap.set("#layer-fox",  { y: 200 });

        tlMobile.to("#layer-sky", { scale: 1.1, duration: 3 })
        .to("#layer-bird", { y: 0, duration: 1.5 }, "-=2.5")
        .to("#layer-bear", { x: 0, duration: 1.5 }, "-=2")
        .to("#layer-fox",  { y: 0, duration: 1.5 }, "-=1.5")
        .to("#text-overlay h1", { opacity: 1, scale: 1, duration: 1 }, "-=1");
        
        // 手機版讓 Header 直接顯示或簡單淡入
        gsap.to("header", { opacity: 1, visibility: "visible", y: 0, delay: 2 });
    });

    // --- 3. Header 滑入 ---
    gsap.to("header", {
        scrollTrigger: {
            trigger: "#intro",
            start: "top 80%",
            toggleActions: "play none none reverse",
        },
        opacity: 1,
        visibility: "visible",
        y: 0,
        duration: 0.5
    });

    // --- 4. DRAWING 橫向捲動 (維持不變) ---
    const drawingSection = document.querySelector("#drawing");
    if (drawingSection) {
        const track = drawingSection.querySelector(".slider-track");
        const getMoveDistance = () => track.scrollWidth - window.innerWidth + (window.innerWidth * 0.2);
        gsap.to(track, {
            x: () => -getMoveDistance(),
            ease: "none",
            scrollTrigger: {
                trigger: drawingSection,
                pin: true,
                scrub: 1,
                start: "top top",
                end: () => "+=" + getMoveDistance(),
                invalidateOnRefresh: true
            }
        });
    }


    // --- 5. 通用圖片切換邏輯 (適用於 PICTURE 與 MODEL) ---
    function setupPhotoSwitcher(sectionId, displayId) {
        const section = document.querySelector(sectionId);
        const photoDisplay = document.querySelector(displayId);
        if (!section || !photoDisplay) return;

        const photoTabs = section.querySelectorAll(".video-tab");

        photoTabs.forEach(tab => {
            tab.addEventListener("click", function() {
                // 切換該區域內的按鈕樣式
                photoTabs.forEach(t => t.classList.remove("active"));
                this.classList.add("active");

                const photoSrc = this.getAttribute("data-photo");

                // 動畫切換
                gsap.to(photoDisplay, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        photoDisplay.src = photoSrc;
                        photoDisplay.onload = () => {
                            gsap.to(photoDisplay, { opacity: 1, duration: 0.3 });
                        };
                    }
                });
            });
        });
    }

    // 執行初始化
    setupPhotoSwitcher("#picture", "#main-photo-display");
    setupPhotoSwitcher("#model", "#main-model-display");


    // --- 6. VIDEO 切換邏輯 (限定在 #video 區塊內) ---
    const videoSection = document.querySelector("#video");
    if (videoSection) {
        const videoTabs = videoSection.querySelectorAll(".video-tab");
        const videoPlayer = videoSection.querySelector("#main-video-player");

        if (videoPlayer) {
            videoPlayer.volume = 0.1;
            videoTabs.forEach(tab => {
                tab.addEventListener("click", function() {
                    videoTabs.forEach(t => t.classList.remove("active"));
                    this.classList.add("active");
                    const videoSrc = this.getAttribute("data-video");

                    gsap.to(videoPlayer, {
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => {
                            videoPlayer.src = videoSrc;
                            videoPlayer.load(); 
                            videoPlayer.onloadeddata = () => {
                                gsap.to(videoPlayer, { opacity: 1, duration: 0.3 });
                            };
                        }
                    });
                });
            });
        }
    }


    
    // --- 7. Footer ---
    gsap.to("#main-footer", {
        scrollTrigger: {
            trigger: "body",       // 監測整個頁面
            start: "bottom bottom", // 當頁面底部 碰到 視窗底部時
        },
        opacity: 1,
        visibility: "visible",
        duration: 0.3
    });




        
});