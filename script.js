/**
 * سكريبت العرض التقديمي الهندسي (Mechatronics Seminar Script)
 * يتحكم في التنقل بين الـ 11 سلايد، المحاكاة الحركية، الملاحظات، ونظام الاختبارات.
 */

document.addEventListener('DOMContentLoaded', () => {
    let currentSlideIndex = 0;
    const slides = document.querySelectorAll('.slide-pane');
    const totalSlides = slides.length;
    const counterDisplay = document.getElementById('slideCounter');
    const progressBar = document.getElementById('progressBar');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    // ملاحظات المتحدث
    const notesToggleBtn = document.getElementById('notesToggleBtn');
    const notesModal = document.getElementById('notesModal');
    const closeNotesBtn = document.getElementById('closeNotesBtn');
    const notesContentBody = document.getElementById('notesContentBody');

    // الاختبار التفاعلي Q&A
    const openQuizModalBtn = document.getElementById('openQuizModalBtn');
    const quizModal = document.getElementById('quizModal');
    const closeQuizBtn = document.getElementById('closeQuizBtn');
    const revealAnsAction = document.getElementById('revealAnsAction');
    const nextQAction = document.getElementById('nextQAction');
    const qTitleText = document.getElementById('qTitleText');
    const qOptionsList = document.getElementById('qOptionsList');
    const qExplanationBox = document.getElementById('qExplanationBox');

    let currentQIdx = 0;

    const quizDataBank = [
        {
            title: "السؤال الأول: ما هو الدور الأساسي للحساس (Sensor)؟",
            options: [
                "أ. إنتاج حركة ميكانيكية دورانية",
                "ب. جمع المعلومات والقياس من البيئة المحيطة",
                "ج. طلاء المنتجات الصناعية بالرش",
                "د. إمداد النظام بالطاقة الكهربائية الرئيسية"
            ],
            correct: 1,
            explanation: "الإجابة الصحيحة: (ب) الحساسات تقيس المتغيرات البيئية وتحولها لإشارات يفهمها نظام التحكم."
        },
        {
            title: "السؤال الثاني: هل يتطلب كل نظام أتمتة (Automation) وجود روبوت؟",
            options: [
                "أ. نعم، لا أتمتة بدون روبوتات",
                "ب. لا، يمكن تشغيل الأتمتة بالـ PLCs والحساسات والسيور دون روبوتات"
            ],
            correct: 1,
            explanation: "الإجابة الصحيحة: (ب) الأتمتة تشمل خطوط الإنتاج والماكينات، والروبوت قد يكون جزءاً منها وليس شرطاً أساسياً."
        },
        {
            title: "السؤال الثالث: أي مكون مسؤول عن تحويل أوامر نظام التحكم إلى حركة ميكانيكية؟",
            options: [
                "أ. الحساس (Sensor)",
                "ب. الكاميرا الذكية (Camera)",
                "ج. المشغل (Actuator)",
                "د. شاشة العرض (Display)"
            ],
            correct: 2,
            explanation: "الإجابة الصحيحة: (ج) المشغلات (Actuators) مثل الموتورات هي عضلات النظام التي تنفذ الحركة."
        },
        {
            title: "السؤال الرابع: كيف يساعد الذكاء الاصطناعي في مراقبة الجودة (Quality Control)؟",
            options: [
                "أ. عن طريق تحليل صور المنتجات واكتشاف العيوب بالرؤية الحاسوبية",
                "ب. عن طريق زيادة الوزن الإجمالي للماكينات",
                "ج. عن طريق إزالة جميع الحساسات من المصنع",
                "د. عن طريق تقليل سرعة خط الإنتاج للصفر"
            ],
            correct: 0,
            explanation: "الإجابة الصحيحة: (أ) الذكاء الاصطناعي يحلل صور الكاميرات للتعرف على العيوب وتصنيف المنتجات."
        }
    ];

    // دالة عرض الشريحة
    function goToSlide(index) {
        if (index < 0 || index >= totalSlides) return;
        
        slides.forEach((pane, idx) => {
            pane.classList.remove('active');
            if (idx === index) {
                pane.classList.add('active');
            }
        });

        currentSlideIndex = index;
        counterDisplay.innerText = `${String(index + 1).padStart(2, '0')} / ${totalSlides}`;
        
        const progressPct = ((index + 1) / totalSlides) * 100;
        progressBar.style.width = `${progressPct}%`;

        renderSpeakerNotes(index);
    }

    function handleNext() {
        if (currentSlideIndex < totalSlides - 1) {
            goToSlide(currentSlideIndex + 1);
        }
    }

    function handlePrev() {
        if (currentSlideIndex > 0) {
            goToSlide(currentSlideIndex - 1);
        }
    }

    nextBtn.addEventListener('click', handleNext);
    prevBtn.addEventListener('click', handlePrev);

    // التنقل بلوحة المفاتيح
    document.addEventListener('keydown', (e) => {
        if (quizModal.classList.contains('active')) return;

        if (e.key === 'ArrowRight' || e.key === 'PageUp') {
            handleNext(); // RTL اتجاه العرض العربي
        } else if (e.key === 'ArrowLeft' || e.key === 'PageDown') {
            handlePrev();
        } else if (e.key === 'f' || e.key === 'F') {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
            }
        } else if (e.key === 'n' || e.key === 'N') {
            notesModal.classList.toggle('active');
        }
    });

    // ملء الشاشة للزر العلوي
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    });

    // إدارة ملاحظات المتحدث
    function renderSpeakerNotes(index) {
        const paneEl = slides[index];
        const notesEl = paneEl.querySelector('.speaker-notes');
        if (notesEl) {
            notesContentBody.innerHTML = `<p><strong>الشريحة رقم ${index + 1} (المدة المقترحة: ${paneEl.dataset.duration || 'دقيقة'}):</strong></p><p style="margin-top:8px;">${notesEl.innerHTML}</p>`;
        } else {
            notesContentBody.innerHTML = "<p>لا توجد ملاحظات مخصصة لهذه الشريحة.</p>";
        }
    }

    notesToggleBtn.addEventListener('click', () => notesModal.classList.toggle('active'));
    closeNotesBtn.addEventListener('click', () => notesModal.classList.remove('active'));

    // محاكاة سير الإنتاج (Slide 5)
    const runSimAction = document.getElementById('runSimAction');
    const simProductBox = document.getElementById('simProductBox');
    const simSensorNode = document.getElementById('simSensorNode');
    const simStatusMsg = document.getElementById('simStatusMsg');

    if (runSimAction) {
        runSimAction.addEventListener('click', () => {
            simProductBox.style.left = '10px';
            simSensorNode.classList.remove('active');
            simStatusMsg.innerText = "جاري تحرك المنتج...";
            
            setTimeout(() => {
                simProductBox.style.left = 'calc(100% - 110px)';
            }, 100);

            setTimeout(() => {
                simSensorNode.classList.add('active');
                simStatusMsg.innerText = "اكتشف الحساس المنتج وأرسل الإشارة للـ PLC!";
            }, 1700);
        });
    }

    // محاكاة الفحص الذكي (Slide 7)
    const triggerAiScan = document.getElementById('triggerAiScan');
    const aiScanBadge = document.getElementById('aiScanBadge');

    if (triggerAiScan) {
        triggerAiScan.addEventListener('click', () => {
            aiScanBadge.innerHTML = `<span style="color:#38bdf8;">جاري فحص المنتج بالرؤية الحاسوبية...</span>`;
            setTimeout(() => {
                const ok = Math.random() > 0.25;
                if (ok) {
                    aiScanBadge.innerHTML = `<span style="color:#34d399;">PASS - منتج مطابق للمواصفات</span>`;
                } else {
                    aiScanBadge.innerHTML = `<span style="color:#f87171;">DEFECT DETECTED - عيوب ظاهرة!</span>`;
                }
            }, 1400);
        });
    }

    // محاكاة حساس المسافة (Slide 8)
    const testSensorBtn = document.getElementById('testSensorBtn');
    const sensorRobotObj = document.getElementById('sensorRobotObj');
    const sensorValText = document.getElementById('sensorValText');

    if (testSensorBtn) {
        testSensorBtn.addEventListener('click', () => {
            sensorRobotObj.style.left = '15px';
            sensorValText.innerText = "120 سم";

            setTimeout(() => {
                sensorRobotObj.style.left = 'calc(100% - 90px)';
                sensorValText.innerText = "15 سم (تم رصد عائق والتوقف الآمن!)";
            }, 100);
        });
    }

    // نظام الاختبار التفاعلي Q&A
    function loadQuizQuestion(idx) {
        const q = quizDataBank[idx];
        qTitleText.innerText = q.title;
        qOptionsList.innerHTML = '';
        qExplanationBox.style.display = 'none';
        qExplanationBox.innerText = q.explanation;

        q.options.forEach((optStr, optNum) => {
            const optBtn = document.createElement('button');
            optBtn.className = 'quiz-option-btn';
            optBtn.innerText = optStr;
            optBtn.addEventListener('click', () => {
                const allOpts = qOptionsList.querySelectorAll('.quiz-option-btn');
                allOpts.forEach((b, bI) => {
                    if (bI === q.correct) b.classList.add('correct');
                    else if (bI === optNum) b.classList.add('incorrect');
                    b.disabled = true;
                });
                qExplanationBox.style.display = 'block';
            });
            qOptionsList.appendChild(optBtn);
        });
    }

    if (openQuizModalBtn) {
        openQuizModalBtn.addEventListener('click', () => {
            currentQIdx = 0;
            loadQuizQuestion(currentQIdx);
            quizModal.classList.add('active');
        });
    }

    if (closeQuizBtn) {
        closeQuizBtn.addEventListener('click', () => quizModal.classList.remove('active'));
    }

    if (revealAnsAction) {
        revealAnsAction.addEventListener('click', () => {
            const q = quizDataBank[currentQIdx];
            const allOpts = qOptionsList.querySelectorAll('.quiz-option-btn');
            allOpts.forEach((b, bI) => {
                if (bI === q.correct) b.classList.add('correct');
                b.disabled = true;
            });
            qExplanationBox.style.display = 'block';
        });
    }

    if (nextQAction) {
        nextQAction.addEventListener('click', () => {
            currentQIdx++;
            if (currentQIdx < quizDataBank.length) {
                loadQuizQuestion(currentQIdx);
            } else {
                qTitleText.innerText = "🎉 انتهت الأسئلة بنجاح! شكراً لتفاعلكم.";
                qOptionsList.innerHTML = '';
                qExplanationBox.style.display = 'none';
                nextQAction.style.display = 'none';
                revealAnsAction.style.display = 'none';
            }
        });
    }

    // بدء العرض بالشريحة الأولى
    goToSlide(0);
});