document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("mean3-reviews-container");
    if (!container) return;

    const productId = container.dataset.productId;
    const shopDomain = container.dataset.shopDomain; // set in Liquid block
    const listContainer = document.getElementById("mean3-reviews-list");
    const form = document.getElementById("mean3-review-form");
    const formContainer = document.getElementById("mean3-review-form-container");
    const writeReviewBtn = document.getElementById("mean3-write-review-toggle");
    const messageContainer = document.getElementById("mean3-form-message");
    const summaryBar = document.getElementById("mean3-summary-bar");
    const lightbox = document.getElementById("mean3-lightbox");
    const lightboxContent = document.querySelector(".mean3-lightbox-content");
    const lightboxClose = document.querySelector(".mean3-lightbox-close");

    // Product details from dataset
    const productTitle = container.dataset.productTitle || "This product";
    const productImage = container.dataset.productImage || "";

    // Store selected photos
    let selectedPhotos = [];

    // State for interactive features
    let currentPage = 1;
    let totalPages = 1;
    let currentType = "PRODUCT";
    let currentSort = "Newest";
    let currentSearch = "";

    // Rating labels
    const ratingLabels = {
        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Very Good",
        5: "Excellent"
    };

    // ==================== STAR PICKER ====================
    const starPicker = document.getElementById("star-picker");
    const ratingInput = document.getElementById("rating-value");
    const ratingText = document.getElementById("rating-text");
    let currentRating = 5;

    if (starPicker) {
        const stars = starPicker.querySelectorAll(".star");

        const updateStars = (rating, isHover = false) => {
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.classList.add("active");
                    if (isHover) star.classList.add("hover");
                } else {
                    star.classList.remove("active");
                    star.classList.remove("hover");
                }
            });
            if (ratingText) {
                ratingText.textContent = ratingLabels[rating] || "";
            }
        };

        // Initial state
        updateStars(currentRating);

        stars.forEach(star => {
            star.addEventListener("click", () => {
                currentRating = parseInt(star.dataset.rating);
                ratingInput.value = currentRating;
                updateStars(currentRating);
            });

            star.addEventListener("mouseenter", () => {
                updateStars(parseInt(star.dataset.rating), true);
            });

            star.addEventListener("mouseleave", () => {
                updateStars(currentRating);
            });
        });
    }

    // ==================== FORM VALIDATION (Enable/Disable Submit) ====================
    const submitBtn = document.getElementById("mean3-submit-btn");
    const nameInput = document.getElementById("customerName");
    const emailInput = document.getElementById("email");
    const commentInput = document.getElementById("comment");

    function toggleSubmitButton() {
        const isValid = nameInput.value.trim() !== "" &&
            emailInput.value.trim() !== "" &&
            commentInput.value.trim() !== "";
        submitBtn.disabled = !isValid;
    }

    // Listen for input on all required fields
    [nameInput, emailInput, commentInput].forEach(input => {
        input.addEventListener("input", toggleSubmitButton);
    });

    // ==================== PHOTO UPLOAD ====================
    const photoBtn = document.getElementById("photo-btn");
    const photoInput = document.getElementById("photos");
    const photoPreview = document.getElementById("photo-preview");

    if (photoBtn && photoInput) {
        photoBtn.addEventListener("click", () => {
            photoInput.click();
        });

        photoInput.addEventListener("change", async (e) => {
            const files = Array.from(e.target.files);
            const maxFiles = 5;
            const maxSize = 2 * 1024 * 1024; // 2MB

            for (const file of files) {
                if (selectedPhotos.length >= maxFiles) {
                    alert("Maximum 5 photos allowed");
                    break;
                }
                if (file.size > maxSize) {
                    alert(`${file.name} is too large. Max 2MB per photo.`);
                    continue;
                }
                if (!file.type.startsWith("image/")) {
                    continue;
                }

                // Convert to base64
                const base64 = await fileToBase64(file);
                selectedPhotos.push(base64);
                addPhotoPreview(base64, selectedPhotos.length - 1);
            }
            // Clear input so same file can be selected again
            photoInput.value = "";
        });
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function addPhotoPreview(base64, index) {
        const wrapper = document.createElement("div");
        wrapper.className = "mean3-preview-item";
        wrapper.innerHTML = `
            <img src="${base64}" alt="Preview">
            <button type="button" class="mean3-remove-photo" data-index="${index}">&times;</button>
        `;
        photoPreview.appendChild(wrapper);

        wrapper.querySelector(".mean3-remove-photo").addEventListener("click", (e) => {
            const idx = parseInt(e.target.dataset.index);
            selectedPhotos.splice(idx, 1);
            rebuildPhotoPreview();
        });
    }

    function rebuildPhotoPreview() {
        photoPreview.innerHTML = "";
        selectedPhotos.forEach((photo, i) => addPhotoPreview(photo, i));
    }

    if (writeReviewBtn && formContainer) {
        writeReviewBtn.addEventListener("click", () => {
            if (formContainer.style.display === "none") {
                formContainer.style.display = "block";
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                formContainer.style.display = "none";
            }
        });
    }

    // Always-visible Write a Review button
    const writeReviewBtnAlways = document.getElementById("mean3-write-review-btn");
    if (writeReviewBtnAlways && formContainer) {
        writeReviewBtnAlways.addEventListener("click", () => {
            if (formContainer.style.display === "none") {
                formContainer.style.display = "block";
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                formContainer.style.display = "none";
            }
        });
    }

    // ==================== FILTERS, SORTING & SEARCH ====================
    const tabsContainer = document.getElementById("mean3-tabs-container");
    const sortSelect = document.getElementById("mean3-sort-select");
    const searchInput = document.getElementById("mean3-search-input");

    if (tabsContainer) {
        const tabs = tabsContainer.querySelectorAll(".mean3-tab");
        tabs.forEach(tab => {
            tab.addEventListener("click", (e) => {
                // Update active class
                tabs.forEach(t => t.classList.remove("active"));
                e.currentTarget.classList.add("active");

                // Update state and fetch
                currentType = e.currentTarget.dataset.type || "PRODUCT";
                fetchReviews(1);
            });
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            fetchReviews(1);
        });
    }

    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = e.target.value.trim();
                fetchReviews(1);
            }, 500); // 500ms debounce
        });
    }

    // ==================== LIGHTBOX / MODAL ====================
    if (lightboxClose) {
        lightboxClose.addEventListener("click", () => {
            lightbox.style.display = "none";
            document.body.style.overflow = "auto";
        });
    }

    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });
    }

    // Renders the full details overlay
    function openLightbox(reviewObj) {
        if (!lightboxContent) return;

        const reviewDate = new Date(reviewObj.createdAt).toLocaleDateString();
        const initial = (reviewObj.customerName || 'A').charAt(0).toUpperCase();

        const productHtml = productImage ? `
            <div class="mean3-review-product-footer">
                <img src="${productImage}" alt="${productTitle}">
                <div class="mean3-footer-text">
                    <span class="mean3-footer-label">Review for</span>
                    <a href="#" class="mean3-footer-title">${productTitle}</a>
                    <span class="mean3-footer-variant">Default Variant</span>
                </div>
            </div>
        ` : '';

        // Determine if there is an image to show on the left
        const hasPhoto = reviewObj.photos && reviewObj.photos.length > 0;
        const photoSection = hasPhoto ? `
            <div class="mean3-lightbox-left">
                <img src="${reviewObj.photos[0]}" alt="Review Photo">
            </div>
        ` : '';

        const userVote = localStorage.getItem(`mean3_voted_${reviewObj.id}`) || null;
        const helpfulActive = userVote === 'helpful' ? 'active-vote' : '';
        const unhelpfulActive = userVote === 'unhelpful' ? 'active-vote' : '';
        const buttonsDisabled = userVote ? 'disabled' : '';

        // Helpful actions
        const actionsHtml = `
            <div class="mean3-review-actions">
                <div class="mean3-helpful" id="helpful-container-${reviewObj.id}-modal">
                    <span class="mean3-helpful-label">Helpful?</span>
                    <button class="mean3-action-btn ${helpfulActive}" ${buttonsDisabled} onclick="window.mean3VoteReview('${reviewObj.id}', 'helpful', this, true)">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg> 
                        <span class="count">${reviewObj.helpfulCount || 0}</span>
                    </button>
                    <button class="mean3-action-btn ${unhelpfulActive}" ${buttonsDisabled} onclick="window.mean3VoteReview('${reviewObj.id}', 'unhelpful', this, true)">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg> 
                        <span class="count">${reviewObj.unhelpfulCount || 0}</span>
                    </button>
                </div>
            </div>
        `;

        const detailsHtml = `
            <div class="mean3-lightbox-right">
                <div class="mean3-avatar-header">
                    <div class="mean3-avatar">${initial}</div>
                    <div class="mean3-author-details">
                        <div class="mean3-name-row">
                            <strong>${reviewObj.customerName || 'Anonymous'}</strong>
                            <span class="mean3-verified-badge">✔ Verified</span>
                        </div>
                        <div class="mean3-star-rating" style="margin-top:4px; margin-bottom:4px; font-size:12px;">
                            ${'★'.repeat(reviewObj.rating)}${'☆'.repeat(5 - reviewObj.rating)}
                        </div>
                        <div class="mean3-meta-row">
                            <span class="mean3-date">${reviewDate}</span>
                        </div>
                    </div>
                </div>
                <p class="mean3-review-text">${reviewObj.comment}</p>
                <div class="mean3-review-meta-extra">
                    <p>Review collected via store invitation</p>
                </div>
                ${actionsHtml}
                ${productHtml}
            </div>
        `;

        lightboxContent.innerHTML = `
            ${photoSection}
            ${detailsHtml}
        `;

        if (!hasPhoto) {
            lightboxContent.style.gridTemplateColumns = '1fr';
            lightboxContent.style.maxWidth = '500px';
        } else {
            lightboxContent.style.gridTemplateColumns = '1fr 400px';
            lightboxContent.style.maxWidth = '900px';
        }

        lightbox.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    // Attach function globally so dynamic cards can call it w/ full object
    window.mean3ReviewsData = [];
    window.mean3OpenLightboxIdx = function (idx) {
        if (window.mean3ReviewsData[idx]) {
            openLightbox(window.mean3ReviewsData[idx]);
        }
    };

    // Global Voting Handler
    window.mean3VoteReview = async function (id, voteType, btnEl, isModal = false) {
        if (btnEl.disabled) return;

        // Save user vote to prevent infinite voting
        localStorage.setItem(`mean3_voted_${id}`, voteType);

        btnEl.classList.add("active-vote");

        // Optimistic UI Update
        const countSpan = btnEl.querySelector(".count");
        if (countSpan) {
            countSpan.textContent = parseInt(countSpan.textContent) + 1;
        }

        // Disable both buttons in the same container to prevent spam
        const container = isModal ? document.getElementById(`helpful-container-${id}-modal`) : document.getElementById(`helpful-container-${id}`);
        if (container) {
            const buttons = container.querySelectorAll("button");
            buttons.forEach(b => b.disabled = true);
        }

        // Keep local data in sync for modal continuity
        const review = window.mean3ReviewsData.find(r => r.id === id);
        if (review) {
            if (voteType === 'helpful') review.helpfulCount = (review.helpfulCount || 0) + 1;
            else if (voteType === 'unhelpful') review.unhelpfulCount = (review.unhelpfulCount || 0) + 1;
        }

        try {
            await fetch(getProxyUrl("/apps/reviews"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "vote", reviewId: id, voteType })
            });
        } catch (err) {
            console.error("Voting failed:", err);
            // Revert on failure (simplified for brevity)
        }
    };

    function getProxyUrl(pathname) {
        // In the theme app extension local preview server (127.0.0.1 / localhost),
        // relative /apps/* requests will hit the preview server, not Shopify.
        // When we know the shop domain, call the shop directly so the App Proxy runs.
        const isLocalPreview =
            window.location.hostname === "127.0.0.1" ||
            window.location.hostname === "localhost";

        if (isLocalPreview && shopDomain) {
            return `https://${shopDomain}${pathname}`;
        }
        return pathname;
    }

    async function fetchJson(url, options) {
        const res = await fetch(url, options);
        if (!res.ok) {
            const body = await res.text().catch(() => "");
            throw new Error(`Request failed: ${res.status} ${res.statusText}${body ? ` - ${body.slice(0, 300)}` : ""}`);
        }
        return res.json();
    }

    // ==================== RENDER SUMMARY BAR ====================
    function renderSummaryBar(stats) {
        if (!stats) {
            summaryBar.style.display = "none";
            return;
        }

        // Update Tab Counts
        if (stats.tabCounts) {
            const elProd = document.getElementById("count-PRODUCT");
            const elStore = document.getElementById("count-STORE");
            const elQuest = document.getElementById("count-QUESTION");
            if (elProd) elProd.textContent = stats.tabCounts.PRODUCT || 0;
            if (elStore) elStore.textContent = stats.tabCounts.STORE || 0;
            if (elQuest) elQuest.textContent = stats.tabCounts.QUESTION || 0;
        }

        if (stats.totalReviews === 0 && currentSearch === "") {
            summaryBar.style.display = "none";
            return;
        }

        summaryBar.style.display = "flex";

        // Update header rating display
        const headerStats = document.getElementById("mean3-header-stats");
        if (headerStats) {
            headerStats.style.display = "flex";
            headerStats.querySelector(".mean3-header-rating-text").textContent = stats.averageRating.toFixed(1);
            headerStats.querySelector(".mean3-header-count-text span").textContent = stats.totalReviews;

            // Update header stars
            const starsContainer = headerStats.querySelector(".mean3-header-stars");
            const fullStars = Math.floor(stats.averageRating);
            const hasHalf = stats.averageRating % 1 >= 0.5;
            let starsHtml = "";
            for (let i = 1; i <= 5; i++) {
                if (i <= fullStars) {
                    starsHtml += '<span class="star filled">★</span>';
                } else if (i === fullStars + 1 && hasHalf) {
                    starsHtml += '<span class="star half">★</span>';
                } else {
                    starsHtml += '<span class="star empty">☆</span>';
                }
            }
            starsContainer.innerHTML = starsHtml;
        }

        // Update distribution bars
        const distContainer = summaryBar.querySelector(".mean3-distribution");
        if (distContainer) {
            let distHtml = "";
            for (let i = 5; i >= 1; i--) {
                const count = stats.distribution[i] || 0;
                const percent = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                let starsStr = '';
                for (let j = 1; j <= 5; j++) {
                    if (j <= i) starsStr += '★';
                    else starsStr += '☆';
                }

                distHtml += `
                    <div class="mean3-dist-row">
                        <span class="mean3-dist-stars">${starsStr}</span>
                        <div class="mean3-dist-bar">
                            <div class="mean3-dist-fill" style="width: ${percent}%"></div>
                        </div>
                        <span class="mean3-dist-count">${count}</span>
                    </div>
                `;
            }
            distContainer.innerHTML = distHtml;
        }

        // Extract photos from reviews for summary
        if (window.mean3ReviewsData && window.mean3ReviewsData.length > 0) {
            const summaryImagesContainer = document.getElementById("mean3-summary-images");
            if (summaryImagesContainer) {
                let photosHtml = "";
                let photoCount = 0;
                for (let r of window.mean3ReviewsData) {
                    if (r.photos && r.photos.length > 0) {
                        for (let p of r.photos) {
                            if (photoCount < 2) { // up to 2 for summary
                                photosHtml += `<img src="${p}" alt="Review snippet photo">`;
                                photoCount++;
                            }
                        }
                    }
                }
                summaryImagesContainer.innerHTML = photosHtml;
            }
        }
    }

    // ==================== RENDER REVIEWS ====================
    function renderReviews(reviews) {
        window.mean3ReviewsData = reviews;

        if (reviews && reviews.length > 0) {
            listContainer.innerHTML = reviews.map((review, idx) => {
                const reviewDate = new Date(review.createdAt).toLocaleDateString();
                const initial = (review.customerName || 'A').charAt(0).toUpperCase();

                // Top full-width photo (only first one)
                let topPhotoHtml = "";
                if (review.photos && review.photos.length > 0) {
                    topPhotoHtml = `
                        <div class="mean3-card-top-photo">
                            <img src="${review.photos[0]}" alt="Review photo">
                        </div>
                    `;
                }

                const productHtml = productImage ? `
                    <div class="mean3-review-product-footer">
                        <img src="${productImage}" alt="${productTitle}">
                        <div class="mean3-footer-text">
                            <span class="mean3-footer-label">Review for</span>
                            <a href="#" class="mean3-footer-title">${productTitle}</a>
                            <span class="mean3-footer-variant">Default Variant</span>
                        </div>
                    </div>
                ` : '';

                const replyHtml = review.reply ? `
                    <div class="mean3-review-reply">
                        <strong>Store Owner</strong>
                        <p>${review.reply}</p>
                    </div>
                ` : '';

                const ratingHtml = `<div class="mean3-star-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>`;

                const userVote = localStorage.getItem(`mean3_voted_${review.id}`) || null;
                const helpfulActive = userVote === 'helpful' ? 'active-vote' : '';
                const unhelpfulActive = userVote === 'unhelpful' ? 'active-vote' : '';
                const buttonsDisabled = userVote ? 'disabled' : '';

                const helpfulHtml = `
                    <div class="mean3-review-actions" onclick="event.stopPropagation()">
                        <div class="mean3-helpful" id="helpful-container-${review.id}">
                            <span class="mean3-helpful-label">Helpful?</span>
                            <button class="mean3-action-btn ${helpfulActive}" ${buttonsDisabled} onclick="window.mean3VoteReview('${review.id}', 'helpful', this, false)">
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg> 
                                <span class="count">${review.helpfulCount || 0}</span>
                            </button>
                            <button class="mean3-action-btn ${unhelpfulActive}" ${buttonsDisabled} onclick="window.mean3VoteReview('${review.id}', 'unhelpful', this, false)">
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg> 
                                <span class="count">${review.unhelpfulCount || 0}</span>
                            </button>
                        </div>
                    </div>
                `;

                return `
                    <div class="mean3-review-card" onclick="window.mean3OpenLightboxIdx(${idx})">
                        ${topPhotoHtml}
                        <div class="mean3-card-content">
                            <div class="mean3-avatar-row">
                                <div class="mean3-avatar">${initial}</div>
                                <div class="mean3-author-details">
                                    <div class="mean3-name-row">
                                        <strong>${review.customerName || 'Anonymous'}</strong>
                                        <span class="mean3-verified-badge">✔ Verified</span>
                                    </div>
                                    ${ratingHtml}
                                    <div class="mean3-meta-row">
                                        <span class="mean3-date">${reviewDate}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <h4 class="mean3-review-title">Feedback</h4>
                            <p class="mean3-review-text">${review.comment}</p>
                            
                            <div class="mean3-review-meta-extra">
                                <p>Review collected via store invitation</p>
                            </div>

                            ${helpfulHtml}
                            ${productHtml}
                            ${replyHtml}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            listContainer.innerHTML = "<p class='mean3-no-reviews'>No reviews yet. Be the first to write one!</p>";
        }

        // Reset any inline styles from previous renders
        listContainer.style.maxWidth = '';
        listContainer.style.margin = '';
        listContainer.style.justifyContent = 'center';
        
        // Add a class to handle column widths when there are 1 or 2 reviews
        listContainer.classList.remove('reviews-count-0', 'reviews-count-1', 'reviews-count-2', 'reviews-count-3');
        if (!reviews || reviews.length === 0) {
            listContainer.classList.add('reviews-count-0');
        } else if (reviews.length === 1) {
            listContainer.classList.add('reviews-count-1');
        } else if (reviews.length === 2) {
            listContainer.classList.add('reviews-count-2');
        } else if (reviews.length === 3) {
            listContainer.classList.add('reviews-count-3');
        }
    }

    // ==================== RENDER PAGINATION ====================
    function renderPagination(pagination) {
        // Remove existing pagination if any
        const existingPagination = document.getElementById("mean3-pagination");
        if (existingPagination) {
            existingPagination.remove();
        }

        // Don't show pagination if only one page or no pages
        if (!pagination || pagination.totalPages <= 1) {
            return;
        }

        totalPages = pagination.totalPages;
        currentPage = pagination.currentPage;

        // Create pagination container
        const paginationContainer = document.createElement("div");
        paginationContainer.id = "mean3-pagination";
        paginationContainer.className = "mean3-pagination";

        // Build pagination HTML
        let paginationHtml = '';

        // Previous button
        paginationHtml += `
            <button class="mean3-page-btn mean3-prev-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                ← Previous
            </button>
        `;

        // Page numbers
        paginationHtml += '<div class="mean3-page-numbers">';
        for (let i = 1; i <= totalPages; i++) {
            // Show first page, last page, current page, and pages around current
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                paginationHtml += `
                    <button class="mean3-page-btn mean3-page-num ${i === currentPage ? 'active' : ''}" data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                paginationHtml += '<span class="mean3-page-ellipsis">...</span>';
            }
        }
        paginationHtml += '</div>';

        // Next button
        paginationHtml += `
            <button class="mean3-page-btn mean3-next-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                Next →
            </button>
        `;

        // Page info
        paginationHtml += `
            <div class="mean3-page-info">
                Page ${currentPage} of ${totalPages} (${pagination.totalReviews} reviews)
            </div>
        `;

        paginationContainer.innerHTML = paginationHtml;

        // Insert pagination after reviews list
        listContainer.insertAdjacentElement('afterend', paginationContainer);

        // Add click handlers
        paginationContainer.querySelectorAll('.mean3-page-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (page && page !== currentPage) {
                    fetchReviews(page);
                }
            });
        });
    }

    // Expose lightbox function globally for inline onclick
    window.mean3OpenLightbox = openLightbox;

    // ==================== FETCH REVIEWS ====================
    function fetchReviews(page = 1) {
        // Render three skeleton cards that mirror the real review card structure
        const skeletonCardHtml = `
            <div class="mean3-review-card mean3-skeleton-loading">
                <div class="mean3-card-content">
                    <!-- Avatar row: circle + name & badge -->
                    <div class="mean3-avatar-row">
                        <div class="mean3-skeleton-bone" style="width:32px;height:32px;border-radius:50%;flex-shrink:0;"></div>
                        <div class="mean3-author-details" style="flex:1;">
                            <div class="mean3-name-row" style="gap:8px;">
                                <div class="mean3-skeleton-bone" style="width:80px;height:12px;"></div>
                                <div class="mean3-skeleton-bone" style="width:60px;height:16px;border-radius:12px;"></div>
                            </div>
                            <!-- Star rating -->
                            <div class="mean3-skeleton-bone" style="width:90px;height:14px;margin-top:6px;"></div>
                            <!-- Date -->
                            <div class="mean3-skeleton-bone" style="width:60px;height:10px;margin-top:4px;"></div>
                        </div>
                    </div>

                    <!-- Feedback title -->
                    <div class="mean3-skeleton-bone" style="width:70px;height:14px;margin-bottom:8px;"></div>
                    <!-- Review text lines -->
                    <div class="mean3-skeleton-bone" style="width:100%;height:10px;margin-bottom:6px;"></div>
                    <div class="mean3-skeleton-bone" style="width:85%;height:10px;margin-bottom:12px;"></div>

                    <!-- Meta extra -->
                    <div class="mean3-skeleton-bone" style="width:180px;height:10px;margin-bottom:16px;"></div>

                    <!-- Helpful actions -->
                    <div style="display:flex;align-items:center;gap:12px;border-top:1px solid #f3f4f6;padding-top:16px;margin-bottom:16px;">
                        <div class="mean3-skeleton-bone" style="width:50px;height:14px;"></div>
                        <div class="mean3-skeleton-bone" style="width:30px;height:14px;"></div>
                        <div class="mean3-skeleton-bone" style="width:30px;height:14px;"></div>
                    </div>

                    <!-- Product footer -->
                    <div style="display:flex;align-items:center;gap:12px;background:#f9fafb;padding:12px;border-radius:6px;">
                        <div class="mean3-skeleton-bone" style="width:40px;height:40px;border-radius:4px;flex-shrink:0;"></div>
                        <div style="flex:1;display:flex;flex-direction:column;gap:5px;">
                            <div class="mean3-skeleton-bone" style="width:60px;height:8px;"></div>
                            <div class="mean3-skeleton-bone" style="width:120px;height:10px;"></div>
                            <div class="mean3-skeleton-bone" style="width:80px;height:8px;"></div>
                        </div>
                    </div>

                    <!-- Store owner reply area -->
                    <div style="margin-top:16px;padding:12px;background:#fdf2f8;border-radius:6px;">
                        <div class="mean3-skeleton-bone" style="width:90px;height:12px;margin-bottom:8px;"></div>
                        <div class="mean3-skeleton-bone" style="width:100%;height:10px;"></div>
                    </div>
                </div>
            </div>`;
            
        listContainer.innerHTML = skeletonCardHtml + skeletonCardHtml + skeletonCardHtml;
        listContainer.style.justifyContent = 'center';

        // Construct query parameters including the interactive states
        const params = new URLSearchParams({
            productId: productId,
            page: page,
            limit: 6,
            type: currentType,
            sort: currentSort,
            q: currentSearch
        });

        fetchJson(`${getProxyUrl("/apps/reviews")}?${params.toString()}`)
            .then(data => {
                renderReviews(data.reviews);
                renderSummaryBar(data.stats);
                renderPagination(data.pagination);

                // Scroll to reviews section on page change (not on initial load)
                if (page > 1 || currentPage !== 1) {
                    listContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            })
            .catch(err => {
                console.error("FetchReviews Error:", err);
                listContainer.innerHTML = `<div style="padding:15px; background:#fee2e2; color:#b91c1c; border-radius:8px;"><b>Failed to load reviews.</b><br/><code>${err.message}</code></div>`;
            });
    }

    // Initial fetch
    fetchReviews(1);

    // ==================== HANDLE SUBMIT ====================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const payload = {
            productId: formData.get("productId"),
            rating: formData.get("rating") || currentRating,
            comment: formData.get("comment"),
            customerName: formData.get("customerName"),
            email: formData.get("email"),
            photos: selectedPhotos,
            type: formData.get("reviewType") || currentType
        };

        try {
            const result = await fetchJson(getProxyUrl("/apps/reviews"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (result.success) {
                messageContainer.textContent = "Review submitted successfully!";
                messageContainer.style.color = "green";
                messageContainer.className = "mean3-message success";
                form.reset();
                selectedPhotos = [];
                photoPreview.innerHTML = "";
                currentRating = 5;
                if (starPicker) {
                    const stars = starPicker.querySelectorAll(".star");
                    stars.forEach((star, index) => {
                        star.classList.toggle("active", index < 5);
                    });
                }
                if (ratingText) ratingText.textContent = "Excellent";
                submitBtn.disabled = true;
            } else {
                messageContainer.textContent = result.error || "Failed to submit review.";
                messageContainer.style.color = "red";
                messageContainer.className = "mean3-message error";
            }
        } catch (err) {
            console.error(err);
            messageContainer.textContent = "An error occurred.";
            messageContainer.style.color = "red";
            messageContainer.className = "mean3-message error";
        }
    });
});
