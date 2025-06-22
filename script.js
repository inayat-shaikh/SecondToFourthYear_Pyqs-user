document.getElementById("name").addEventListener("input", function (e) {
  let value = e.target.value;
  let processedValue = "";

  // Remove numbers, special characters, and whitespace - keep only letters
  for (let i = 0; i < value.length; i++) {
    let char = value[i];
    if (/[a-zA-Z]/.test(char)) {
      processedValue += char;
    }
  }

  // Check character limit
  if (processedValue.length > 20) {
    alert("Name cannot exceed 20 characters!");
    processedValue = processedValue.substring(0, 20);
  }

  // Make first character uppercase, rest lowercase
  if (processedValue.length > 0) {
    processedValue =
      processedValue.charAt(0).toUpperCase() +
      processedValue.slice(1).toLowerCase();
  }

  // Update the input value
  e.target.value = processedValue;
});

// Prevent paste of invalid content
document.getElementById("name").addEventListener("paste", function (e) {
  e.preventDefault();
  let pastedText = (e.clipboardData || window.clipboardData).getData("text");

  // Filter out invalid characters
  let validText = pastedText.replace(/[^a-zA-Z]/g, "");

  if (validText.length > 20) {
    alert("Name cannot exceed 20 characters!");
    validText = validText.substring(0, 20);
  }

  if (validText.length > 0) {
    validText =
      validText.charAt(0).toUpperCase() + validText.slice(1).toLowerCase();
  }

  this.value = validText;
});

// Prevent keydown of invalid characters (optional - for better UX)
document.getElementById("name").addEventListener("keydown", function (e) {
  // Allow backspace, delete, tab, escape, enter
  if (
    [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    (e.keyCode === 65 && e.ctrlKey === true) ||
    (e.keyCode === 67 && e.ctrlKey === true) ||
    (e.keyCode === 86 && e.ctrlKey === true) ||
    (e.keyCode === 88 && e.ctrlKey === true)
  ) {
    return;
  }

  // Ensure that it's a letter and not already at 20 characters
  if (!/[a-zA-Z]/.test(e.key) || this.value.length >= 20) {
    e.preventDefault();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const resourcesInput = document.getElementById("resourcesInput");
  const prefix = "Resources_";
  const maxLength = 30; // excluding prefix
  const allowedCharsRegex = /[^a-zA-Z0-9\s._-]/g;

  // Utility function to ensure cursor is always after prefix
  function enforceCursorPosition(element) {
    const start = element.selectionStart;
    const end = element.selectionEnd;

    if (start < prefix.length || end < prefix.length) {
      element.setSelectionRange(prefix.length, Math.max(prefix.length, end));
      return true; // Position was corrected
    }
    return false; // Position was already correct
  }

  // Utility function to validate and clean input
  function validateInput(value, maintainCursor = true) {
    let cursorPosition = maintainCursor
      ? resourcesInput.selectionStart
      : prefix.length;

    // Ensure prefix is intact
    if (!value.startsWith(prefix)) {
      // If prefix is completely missing, restore it
      if (!value.includes(prefix.substring(0, prefix.length - 1))) {
        value = prefix + value;
      } else {
        // If prefix is partially there, fix it
        value =
          prefix +
          value.replace(
            new RegExp("^.*?" + prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
            ""
          );
      }
      cursorPosition = Math.max(prefix.length, cursorPosition);
    }

    // Extract and clean user input
    let userInput = value.substring(prefix.length);
    let cleanUserInput = userInput.replace(allowedCharsRegex, "");

    // Apply length limit
    if (cleanUserInput.length > maxLength) {
      cleanUserInput = cleanUserInput.substring(0, maxLength);
    }

    return {
      value: prefix + cleanUserInput,
      cursorPosition: Math.min(
        cursorPosition,
        prefix.length + cleanUserInput.length
      ),
    };
  }

  // Initialize input
  if (resourcesInput) {
    resourcesInput.value = prefix;
    resourcesInput.setSelectionRange(prefix.length, prefix.length);

    // Input event handler
    resourcesInput.addEventListener("input", function (e) {
      const result = validateInput(e.target.value);

      // Check if length limit was exceeded
      const userInputLength = e.target.value
        .substring(prefix.length)
        .replace(allowedCharsRegex, "").length;
      if (userInputLength > maxLength) {
        alert(
          `Resources cannot exceed ${maxLength} characters (excluding "Resources_")`
        );
      }

      e.target.value = result.value;
      e.target.setSelectionRange(result.cursorPosition, result.cursorPosition);
    });

    // Comprehensive keydown handler
    resourcesInput.addEventListener("keydown", function (e) {
      const cursorStart = e.target.selectionStart;
      const cursorEnd = e.target.selectionEnd;
      const hasSelection = cursorStart !== cursorEnd;

      // Keys that should be completely blocked in prefix area
      const blockedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "PageUp",
        "PageDown",
      ];

      // Block basic navigation and deletion keys in prefix
      if (blockedKeys.includes(e.key)) {
        if (
          cursorStart < prefix.length ||
          (hasSelection && cursorStart < prefix.length)
        ) {
          e.preventDefault();
          e.target.setSelectionRange(prefix.length, prefix.length);
          return;
        }

        // Special handling for backspace at the boundary
        if (
          e.key === "Backspace" &&
          cursorStart === prefix.length &&
          !hasSelection
        ) {
          e.preventDefault();
          return;
        }
      }

      // Handle ArrowRight specially
      if (e.key === "ArrowRight" && cursorStart < prefix.length) {
        e.preventDefault();
        e.target.setSelectionRange(prefix.length, prefix.length);
        return;
      }

      // Handle Ctrl/Cmd combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "a": // Select All
            e.preventDefault();
            e.target.setSelectionRange(prefix.length, e.target.value.length);
            return;

          case "x": // Cut
          case "c": // Copy
            if (cursorStart < prefix.length) {
              e.preventDefault();
              return;
            }
            break;

          case "z": // Undo
            e.preventDefault();
            return;

          case "y": // Redo
            e.preventDefault();
            return;

          case "left": // Ctrl+Left (word navigation)
          case "right": // Ctrl+Right
          case "home": // Ctrl+Home
          case "end": // Ctrl+End
            if (cursorStart < prefix.length) {
              e.preventDefault();
              e.target.setSelectionRange(prefix.length, prefix.length);
              return;
            }
            break;
        }
      }

      // Handle Shift combinations for selection
      if (e.shiftKey) {
        const selectionKeys = [
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
          "PageUp",
          "PageDown",
        ];
        if (selectionKeys.includes(e.key) && cursorStart < prefix.length) {
          e.preventDefault();
          return;
        }
      }

      // Prevent any character input that would place cursor in prefix
      if (e.key.length === 1 && cursorStart < prefix.length) {
        e.preventDefault();
        // Insert the character after the prefix instead
        const char = e.key;
        if (!allowedCharsRegex.test(char)) {
          const currentValue = e.target.value;
          const newValue =
            currentValue.substring(0, prefix.length) +
            char +
            currentValue.substring(prefix.length);
          const result = validateInput(newValue, false);
          e.target.value = result.value;
          e.target.setSelectionRange(prefix.length + 1, prefix.length + 1);
        }
        return;
      }
    });

    // Enhanced paste handler
    resourcesInput.addEventListener("paste", function (e) {
      e.preventDefault();

      let paste = (e.clipboardData || window.clipboardData).getData("text");
      let cursorPosition = Math.max(e.target.selectionStart, prefix.length);
      let selectionEnd = Math.max(e.target.selectionEnd, prefix.length);

      // Clean the pasted content
      let cleanPaste = paste.replace(allowedCharsRegex, "");

      // Get current user input
      let currentUserInput = this.value.substring(prefix.length);
      let beforeCursor = currentUserInput.substring(
        0,
        cursorPosition - prefix.length
      );
      let afterCursor = currentUserInput.substring(
        selectionEnd - prefix.length
      );

      // Insert cleaned paste
      let newUserInput = beforeCursor + cleanPaste + afterCursor;

      // Check length limit
      if (newUserInput.length > maxLength) {
        alert(
          `Resources cannot exceed ${maxLength} characters (excluding "Resources_")`
        );
        newUserInput = newUserInput.substring(0, maxLength);
      }

      // Update value
      this.value = prefix + newUserInput;

      // Set cursor position
      let newCursorPosition = Math.min(
        cursorPosition + cleanPaste.length,
        this.value.length
      );
      this.setSelectionRange(newCursorPosition, newCursorPosition);
    });

    // Mouse interaction handlers
    resourcesInput.addEventListener("mousedown", function (e) {
      // Allow the mousedown to proceed, but we'll fix the position after
      setTimeout(() => enforceCursorPosition(e.target), 0);
    });

    resourcesInput.addEventListener("click", function (e) {
      enforceCursorPosition(e.target);
    });

    resourcesInput.addEventListener("focus", function (e) {
      enforceCursorPosition(e.target);
    });

    // Additional safeguards
    resourcesInput.addEventListener("select", function (e) {
      enforceCursorPosition(e.target);
    });

    // Mutation observer to catch any programmatic changes
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "value"
        ) {
          const result = validateInput(resourcesInput.value);
          if (resourcesInput.value !== result.value) {
            resourcesInput.value = result.value;
            resourcesInput.setSelectionRange(
              result.cursorPosition,
              result.cursorPosition
            );
          }
        }
      });
    });

    observer.observe(resourcesInput, {
      attributes: true,
      attributeFilter: ["value"],
    });

    // Periodic validation (fallback safety net)
    let lastValue = resourcesInput.value;
    setInterval(function () {
      if (resourcesInput.value !== lastValue) {
        const result = validateInput(resourcesInput.value);
        if (resourcesInput.value !== result.value) {
          resourcesInput.value = result.value;
          enforceCursorPosition(resourcesInput);
        }
        lastValue = resourcesInput.value;
      }

      // Ensure cursor position is always correct
      if (document.activeElement === resourcesInput) {
        enforceCursorPosition(resourcesInput);
      }
    }, 100);

    // Handle drag and drop
    resourcesInput.addEventListener("dragover", function (e) {
      e.preventDefault();
    });

    resourcesInput.addEventListener("drop", function (e) {
      e.preventDefault();
      const droppedText = e.dataTransfer.getData("text");

      // Treat drop like paste
      const cleanText = droppedText.replace(allowedCharsRegex, "");
      const currentUserInput = this.value.substring(prefix.length);
      let newUserInput = currentUserInput + cleanText;

      if (newUserInput.length > maxLength) {
        alert(
          `Resources cannot exceed ${maxLength} characters (excluding "Resources_")`
        );
        newUserInput = newUserInput.substring(0, maxLength);
      }

      this.value = prefix + newUserInput;
      this.setSelectionRange(this.value.length, this.value.length);
    });

    // Prevent context menu in prefix area
    resourcesInput.addEventListener("contextmenu", function (e) {
      if (this.selectionStart < prefix.length) {
        e.preventDefault();
      }
    });
  }

  // --- STEP 1 ELEMENTS ---
  const step1Section = document.getElementById("step1");
  const step1Form = document.getElementById("step1Form");
  const step1SubmitBtn = document.getElementById("step1Submit");
  const nameInput = document.getElementById("name");
  const branchInput = document.getElementById("branch");
  const yearInput = document.getElementById("year");

  // --- STEP 2 ELEMENTS ---
  const step2Section = document.getElementById("step2");
  const step2SubmitBtn = document.getElementById("step2Submit");
  const semInput = document.getElementById("SEM");
  const subjectCheckbox = document.getElementById("subject");
  const resourcesCheckbox = document.getElementById("resources");
  const subjectDetailSection = document.getElementById("subjectDetail");
  const resourcesDetailSection = document.getElementById("resourcesDetail");
  const subjectInput = document.getElementById("subjectInput");
  const fileTypeCheckboxes = document.querySelectorAll(
    'input[type="checkbox"]'
  );

  // --- STEP 3 ELEMENTS ---
  const step3Section = document.getElementById("step3");
  const finalSubmitBtn = document.getElementById("finalSubmit");
  const fileInput = document.getElementById("dropzone-file");
  const dropzoneLabel = document.getElementById("dropzone");
  const initialFileContainer = document.getElementById("file-container");
  const fileIconContainer = document.getElementById("file-icon");
  const fileNameDisplay = document.getElementById("file-name-display");

  // --- UPLOAD SCREEN & PROGRESS BAR ELEMENTS ---
  const uploadProgressScreen = document.getElementById(
    "upload-progress-screen"
  );
  const uploadStatusMessage = document.getElementById("upload-status-message");
  const nextFileMessage = document.getElementById("next-file-message");
  const progressCircle = document.querySelector(".progress-circle");
  const progressValue = document.querySelector(".progress-value");
  const progressRingCircle = document.querySelector(".progress-ring__circle");
  let progressInterval;

  // --- SCRIPT DATA ---
  const appsScriptUrl =
    "https://script.google.com/macros/s/AKfycbwEQqc4VzxmwmvHC5ggjIGyAqO0EzO9JxivppqQYcg3bNqfSoHAO3iaTmqeRJb90sCgrg/exec";
  let userDetails = {};
  let filesToUpload = [];
  let currentFileIndex = 0;

  // --- MODAL ELEMENT (Dynamically Created) ---
  let successModal = null;

  function createSuccessModal(message) {
    if (successModal) successModal.remove();

    successModal = document.createElement("div");
    successModal.innerHTML = `
      <div id="success" style="display: flex; font-family: 'Plus Jakarta Sans', sans-serif;"
          class="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center p-4" aria-labelledby="modal-title"
          role="dialog" aria-modal="true">
          <div class="w-full max-w-sm sm:max-w-md mx-2 sm:mx-0">
              <div style="background: rgba(0, 0, 0, 0.441); backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);" class="fixed inset-0 transition-opacity" aria-hidden="true"></div>
              <div style="border-radius: 35px;"
                  class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full">
                  <div class="flex items-center justify-between p-1 md:p-5 border-b rounded-t">
                      <h3 class="text-xl font-semibold text-gray-900 w-full text-center">
                          <div class="dotlottie-container">
                              <dotlottie-player
                                  src="https://lottie.host/b262bbf7-05a6-4a30-b6e3-648b52389ffe/o5joDCtkZz.json"
                                  background="transparent" speed="1" style="width: 80px; height: 80px;" loop
                                  autoplay></dotlottie-player>
                              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </div>File Uploaded Successfully!
                      </h3>
                  </div>
                  <div class="p-3 md:p-5 space-y-4 text-center">
                      <p id="modalMessage" class="text-base leading-relaxed">${message}</p>
                      <div
                          class="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <button id="okbtn"
                              class="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 inline-flex items-center">
                              <span class="plus-jakarta-sans">Got it</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    `;
    document.body.appendChild(successModal);

    // Load Lottie player script if not already loaded
    if (!document.querySelector('script[src*="lottie-player"]')) {
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.js";
      document.head.appendChild(script);
    }

    // Add event listener to "Got it" button
    const okBtn = successModal.querySelector("#okbtn");
    okBtn.addEventListener("click", () => {
      successModal.remove();
      successModal = null;
      if (currentFileIndex < filesToUpload.length) {
        promptForNextFile();
      } else {
        location.reload();
      }
    });
  }

  // --- EVENT LISTENERS & LOGIC ---

  step1SubmitBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const branch = branchInput.value;
    if (!name || branch === "Select Which Branch Of Pyqs Uploading") {
      alert("Please fill in your name and select a branch.");
      return;
    }
    userDetails = { name, branch, year: yearInput.value };
    step1Form
      .querySelectorAll("input, select, button")
      .forEach((el) => (el.disabled = true));
    step2Section.classList.remove("hidden");
    step2Section.scrollIntoView({ behavior: "smooth" });
  });

  subjectCheckbox.addEventListener("change", () => {
    subjectDetailSection.classList.toggle("hidden", !subjectCheckbox.checked);
  });

  resourcesCheckbox.addEventListener("change", () => {
    resourcesDetailSection.classList.toggle(
      "hidden",
      !resourcesCheckbox.checked
    );
  });

  step2SubmitBtn.addEventListener("click", () => {
    const selectedSem = semInput.value;
    const selectedFiles = Array.from(fileTypeCheckboxes).filter(
      (cb) => cb.checked && cb.id !== "subject" && cb.id !== "resources"
    );
    const subjectName = subjectInput.value.trim();
    const resourcesName = resourcesInput.value.trim().replace("Resources_", "");

    if (selectedSem === "Select Which SEM PYQS Uploading") {
      alert("Please select a SEM.");
      return;
    }
    if (subjectCheckbox.checked && !subjectName) {
      alert("Please enter the subject name.");
      return;
    }
    if (resourcesCheckbox.checked && !resourcesName) {
      alert("Please enter the resources name.");
      return;
    }
    if (
      selectedFiles.length === 0 &&
      !subjectCheckbox.checked &&
      !resourcesCheckbox.checked
    ) {
      alert("Please select at least one file type to upload.");
      return;
    }
    if (
      selectedFiles.length > 3 ||
      (selectedFiles.length === 3 &&
        (subjectCheckbox.checked || resourcesCheckbox.checked)) ||
      (selectedFiles.length === 2 &&
        subjectCheckbox.checked &&
        resourcesCheckbox.checked)
    ) {
      alert(
        "You can select a maximum of 3 file types (including Subject and Resources)."
      );
      return;
    }

    userDetails.sem = selectedSem;
    if (subjectCheckbox.checked) userDetails.subjectName = subjectName;
    if (resourcesCheckbox.checked) userDetails.resourcesName = resourcesName;

    const order = ["resources", "subject", "ESE", "ISE1", "ISE2", "COMBINED"];
    filesToUpload = order.filter((id) => document.getElementById(id)?.checked);

    step2Section
      .querySelectorAll("input, select, button")
      .forEach((el) => (el.disabled = true));
    step3Section.classList.remove("hidden");
    step3Section.scrollIntoView({ behavior: "smooth" });
    promptForFirstFile();
  });

  fileInput.addEventListener("change", function () {
    if (this.files.length > 0) {
      const file = this.files[0];
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed.");
        this.value = "";
        return;
      }
      initialFileContainer.classList.add("hidden");
      fileNameDisplay.textContent = file.name;
      fileIconContainer.classList.remove("hidden");
    }
  });

  finalSubmitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (fileInput.files.length === 0) {
      alert("Please select a file to upload.");
      return;
    }

    // --- PREPARE & SHOW UPLOAD SCREEN ---
    prepareUploadScreen();
    uploadProgressScreen.classList.remove("hidden");

    // --- START PROGRESS SIMULATION ---
    let progress = 0;
    let isUploadComplete = false;
    const file = fileInput.files[0];
    const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to MB

    // Define progress parameters based on file size
    let intervalDelay, fastIncrement, slowIncrement;
    if (fileSizeMB < 1) {
      // Small files (< 5MB)
      intervalDelay = 150;
      fastIncrement = () => Math.random() * 0.5 + 0.1; // 0.5–0.6%
      slowIncrement = () => Math.random() * 0.5 + 0.1; // 0.5–0.1%
    } else if (fileSizeMB < 20) {
      // Medium files (5MB–20MB)
      intervalDelay = 250;
      fastIncrement = () => Math.random() * 0.1 + 0.2; // 0.5–1%
      slowIncrement = () => Math.random() * 0.1 + 0.1; // 0.4–0.3%
    } else {
      // Large files (> 20MB)
      intervalDelay = 450;
      fastIncrement = () => Math.random() * 0.1 + 0.2; // 1–2%
      slowIncrement = () => Math.random() * 0.1 + 0.1; // 0.1–0.3%
    }

    // Progress simulation
    progressInterval = setInterval(() => {
      if (isUploadComplete) {
        // If upload is complete, rapidly jump to 100%
        progress = 100;
        updateProgressBar(progress);
        clearInterval(progressInterval);
      } else if (progress < 90) {
        // Fast progress to 90%
        progress += fastIncrement();
        if (progress > 90) progress = 90;
        updateProgressBar(progress);
      } else if (progress < 98) {
        // Slower progress from 90% to 98%
        progress += slowIncrement();
        if (progress > 98) progress = 98;
        updateProgressBar(progress);
      }
    }, intervalDelay);

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64File = reader.result.split(",")[1];

      let fileType = getFriendlyName(filesToUpload[currentFileIndex], false);
      let newFileName;

      if (filesToUpload[currentFileIndex] === "resources") {
        newFileName = `${userDetails.branch}_Resources_${userDetails.resourcesName}_${userDetails.sem}(${userDetails.name})<${userDetails.year}>.pdf`;
      } else {
        newFileName = `${userDetails.branch}_${fileType.replace(/ /g, "")}_${
          userDetails.sem
        }(${userDetails.name})<${userDetails.year}>.pdf`;
      }

      const payload = {
        fileName: newFileName,
        mimeType: file.type,
        base64File: base64File,
        branch: userDetails.branch,
        sem: userDetails.sem,
      };

      fetch(appsScriptUrl, { method: "POST", body: JSON.stringify(payload) })
        .then((res) => res.json())
        .then((data) => {
          isUploadComplete = true; // Mark upload as complete
          if (data.status === "success") {
            setTimeout(() => {
              uploadProgressScreen.classList.add("hidden");
              currentFileIndex++;
              const currentFileFriendlyName = getFriendlyName(
                filesToUpload[currentFileIndex - 1]
              );
              let message = `Your <span class="bg-blue-100 text-blue-800 font-medium me-2 px-1.5 py-0.5 rounded">${currentFileFriendlyName}</span> file has been uploaded successfully!`;
              if (currentFileIndex < filesToUpload.length) {
                const nextFileFriendlyName = getFriendlyName(
                  filesToUpload[currentFileIndex]
                );
                message += `<br>Next, proceed to upload the PDF for: <span class="bg-blue-100 text-blue-800 font-medium me-2 px-1.5 py-0.5 rounded">${nextFileFriendlyName}</span>`;
              } else {
                message += `<br><span class="bg-green-100 text-green-800 font-medium me-2 px-1.5 py-0.5 rounded">All files uploaded successfully!</span>`;
              }
              createSuccessModal(message);
            }, 1200);
          } else {
            throw new Error(data.message || "An unknown error occurred.");
          }
        })
        .catch((error) => {
          clearInterval(progressInterval);
          console.error("Upload Error:", error);
          alert(`An error occurred during upload: ${error.message}`);
          uploadProgressScreen.classList.add("hidden");
          resetForNextUpload();
        });
    };

    reader.onerror = (error) => {
      clearInterval(progressInterval);
      console.error("File Read Error:", error);
      alert("Error reading the file.");
      uploadProgressScreen.classList.add("hidden");
      resetForNextUpload();
    };
  });

  // --- HELPER FUNCTIONS ---

  function getFriendlyName(fileType, includeSubjectName = true) {
    if (fileType === "subject" && includeSubjectName)
      return `Subject (${userDetails.subjectName})`;
    if (fileType === "subject" && !includeSubjectName)
      return userDetails.subjectName;
    if (fileType === "resources" && includeSubjectName)
      return `Resources (${userDetails.resourcesName})`;
    if (fileType === "resources" && !includeSubjectName)
      return userDetails.resourcesName;
    if (fileType === "ISE1") return "ISE 1";
    if (fileType === "ISE2") return "ISE 2";
    return fileType; // ESE, COMBINED
  }

  function prepareUploadScreen() {
    const currentFileFriendlyName = getFriendlyName(
      filesToUpload[currentFileIndex]
    );
    uploadStatusMessage.textContent = `Uploading your ${currentFileFriendlyName} file. Please wait...`;

    const nextIndex = currentFileIndex + 1;
    if (nextIndex < filesToUpload.length) {
      const nextFileFriendlyName = getFriendlyName(filesToUpload[nextIndex]);
      nextFileMessage.textContent = `Next up: ${nextFileFriendlyName}`;
    } else {
      nextFileMessage.textContent = "This is the last file.";
    }
  }

  function updateProgressBar(value) {
    progressValue.textContent = `${Math.round(value)}%`;
    const circumference = 408.407; // 2 * π * 65
    const offset = circumference - (value / 100) * circumference;
    progressRingCircle.style.strokeDashoffset = offset;
  }

  function promptForNextFile() {
    const fileTypeToUpload = getFriendlyName(filesToUpload[currentFileIndex]);
    dropzoneLabel.querySelector(
      ".font-semibold"
    ).textContent = `Upload ${fileTypeToUpload}`;
    resetForNextUpload();
  }

  function promptForFirstFile() {
    const fileTypeToUpload = getFriendlyName(filesToUpload[currentFileIndex]);
    alert(`Proceed To Upload PDF for: ${fileTypeToUpload}`);
    dropzoneLabel.querySelector(
      ".font-semibold"
    ).textContent = `Upload ${fileTypeToUpload}`;
    resetForNextUpload();
  }

  function resetForNextUpload() {
    updateProgressBar(0);
    finalSubmitBtn.disabled = false;
    finalSubmitBtn.textContent = "Upload";
    fileInput.value = "";
    initialFileContainer.classList.remove("hidden");
    fileIconContainer.classList.add("hidden");
    fileNameDisplay.textContent = "";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Get references to elements
  const firstYear = document.getElementById("firstYear");
  const secondYear = document.getElementById("secondYear");
  const firstYearUpload = document.getElementById("firstYearUpload");
  const secondYearUpload = document.getElementById("secondYearUpload");
  const switchButtonContainer = document.getElementById(
    "switchButtonContainer"
  );
  const switchButton = document.getElementById("switchButton");
  const closeSwitchModal = document.getElementById("closeSwitchModal");
  const switchModal = document.getElementById("switchModal");

  // Get references to switch trigger elements
  const switchSpan = document.getElementById("switch");
  const switchSvg = switchSpan ? switchSpan.querySelector("svg") : null;

  // URL mappings for each radio button
  const urlMappings = {
    firstYear: "https://pyqs-isk.pages.dev",
    secondYear: "https://cups-user.vercel.app",
    firstYearUpload: "https://1yr-pyqsupload-isk.pages.dev",
    secondYearUpload: "https://cups-admin.vercel.app",
  };

  // Function to show the modal with stack-out animation and dramatic overlay effect
  function showModal() {
    // First, show the modal without overlay
    switchModal.classList.remove("hidden");
    switchModal.style.display = "flex";

    // Get the modal content element
    const modalContent = switchModal.querySelector(".bg-gray-800");
    const modalOverlay = switchModal.querySelector(".fixed.inset-0");

    // Initially hide overlay with dramatic starting state
    if (modalOverlay) {
      modalOverlay.style.opacity = "0";
      modalOverlay.style.transform = "scale(1.1)";
      modalOverlay.style.filter = "blur(8px)";
    }

    // Initial state for modal content (stack-out animation)
    if (modalContent) {
      modalContent.style.opacity = "0";
      modalContent.style.transform = "scale(0.8) translateY(20px)";
      modalContent.style.transition =
        "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    }

    // First animate the modal content
    setTimeout(() => {
      if (modalContent) {
        modalContent.style.opacity = "1";
        modalContent.style.transform = "scale(1) translateY(0px)";
      }

      // Then apply dramatic overlay effect after a short delay
      setTimeout(() => {
        if (modalOverlay) {
          modalOverlay.style.transition =
            "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          modalOverlay.style.opacity = "1";
          modalOverlay.style.transform = "scale(1)";
          modalOverlay.style.filter = "blur(0px)";
        }
      }, 150);
    }, 10);

    // Enhanced auto-scroll to center modal perfectly
    setTimeout(() => {
      centerModalOnScreen();
    }, 50);
  }

  // Enhanced function to center modal perfectly on screen
  function centerModalOnScreen() {
    const modalContent = switchModal.querySelector(".bg-gray-800");
    if (modalContent) {
      const rect = modalContent.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const modalHeight = rect.height;

      // Calculate the exact center position
      const currentModalCenter = rect.top + modalHeight / 2;
      const desiredModalCenter = viewportHeight / 2;
      const scrollAdjustment = currentModalCenter - desiredModalCenter;

      // Only scroll if the modal isn't already perfectly centered (with 50px tolerance)
      if (Math.abs(scrollAdjustment) > 50) {
        const targetScrollY = window.pageYOffset + scrollAdjustment;

        // Enhanced smooth scroll with custom easing
        const startScrollY = window.pageYOffset;
        const distance = targetScrollY - startScrollY;
        const duration = 800; // Longer, more elegant scroll
        let startTime = null;

        function animateScroll(currentTime) {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);

          // Custom easing function (ease-out-cubic)
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);

          const currentScrollY = startScrollY + distance * easeOutCubic;
          window.scrollTo(0, currentScrollY);

          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        }

        requestAnimationFrame(animateScroll);
      }
    }
  }

  // Function to show switch button with enhanced animation
  function showSwitchButton(url) {
    switchButton.href = url;

    // If button is already visible, show selection change animation
    if (!switchButtonContainer.classList.contains("hidden")) {
      // Quick pulse and color change animation for selection change
      switchButton.style.transition = "all 0.2s ease-in-out";
      switchButton.style.transform = "scale(0.95)";
      switchButton.style.backgroundColor = "#059669"; // darker green

      setTimeout(() => {
        switchButton.style.transform = "scale(1.05)";
        switchButton.style.backgroundColor = "#10b981"; // brighter green
      }, 100);

      setTimeout(() => {
        switchButton.style.transform = "scale(1)";
        switchButton.style.backgroundColor = ""; // reset to default
        switchButton.style.transition = "";
      }, 300);
    } else {
      // Initial show animation
      switchButtonContainer.classList.remove("hidden");

      // Enhanced entrance animation with multiple effects
      switchButton.style.transform = "scale(0.8) rotateX(90deg)";
      switchButton.style.opacity = "0";
      switchButton.style.transition =
        "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

      // Trigger animation after a small delay to ensure the element is rendered
      setTimeout(() => {
        switchButtonContainer.classList.remove("opacity-0", "translate-y-4");
        switchButtonContainer.classList.add("opacity-100", "translate-y-0");

        switchButton.style.transform = "scale(1) rotateX(0deg)";
        switchButton.style.opacity = "1";

        // Add a subtle glow effect
        setTimeout(() => {
          switchButton.style.boxShadow = "0 0 20px rgba(16, 185, 129, 0.4)";
          setTimeout(() => {
            switchButton.style.boxShadow = "";
            switchButton.style.transition = "";
          }, 800);
        }, 200);
      }, 10);
    }
  }

  // Function to hide switch button with enhanced animation
  function hideSwitchButton() {
    // Enhanced exit animation
    switchButton.style.transition =
      "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
    switchButton.style.transform = "scale(0.7) rotateX(-90deg)";
    switchButton.style.opacity = "0";

    switchButtonContainer.classList.remove("opacity-100", "translate-y-0");
    switchButtonContainer.classList.add("opacity-0", "translate-y-4");

    // Hide the element after animation completes
    setTimeout(() => {
      switchButtonContainer.classList.add("hidden");

      // Reset button state
      switchButton.style.transform = "scale(1) rotateX(0deg)";
      switchButton.style.opacity = "1";
      switchButton.style.transition = "";
    }, 400);
  }

  // Add event listeners to switch trigger elements
  if (switchSpan) {
    switchSpan.addEventListener("click", function (e) {
      e.preventDefault();
      showModal();
    });
  }

  if (switchSvg) {
    switchSvg.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
      showModal();
    });
  }

  // Add event listeners to radio buttons
  if (firstYear) {
    firstYear.addEventListener("change", function () {
      if (this.checked) {
        showSwitchButton(urlMappings.firstYear);
      }
    });
  }

  if (secondYear) {
    secondYear.addEventListener("change", function () {
      if (this.checked) {
        showSwitchButton(urlMappings.secondYear);
      }
    });
  }

  if (firstYearUpload) {
    firstYearUpload.addEventListener("change", function () {
      if (this.checked) {
        showSwitchButton(urlMappings.firstYearUpload);
      }
    });
  }

  if (secondYearUpload) {
    secondYearUpload.addEventListener("change", function () {
      if (this.checked) {
        showSwitchButton(urlMappings.secondYearUpload);
      }
    });
  }

  // Close modal functionality with enhanced stack-in animation and dramatic overlay removal
  if (closeSwitchModal) {
    closeSwitchModal.addEventListener("click", function () {
      const modalContent = switchModal.querySelector(".bg-gray-800");
      const modalOverlay = switchModal.querySelector(".fixed.inset-0");

      // First create dramatic overlay fade-out with reverse effects
      if (modalOverlay) {
        modalOverlay.style.transition =
          "all 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53)";
        modalOverlay.style.opacity = "0";
        modalOverlay.style.transform = "scale(1.05)";
        modalOverlay.style.filter = "blur(4px)";
      }

      // Then animate modal content with enhanced stack-in effect
      setTimeout(() => {
        if (modalContent) {
          modalContent.style.transition =
            "all 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
          modalContent.style.opacity = "0";
          modalContent.style.transform =
            "scale(0.65) translateY(-40px) rotateX(10deg)";
        }
      }, 100);

      // Hide modal after all animations complete
      setTimeout(() => {
        switchModal.classList.add("hidden");
        switchModal.style.display = "none";

        // Reset modal state for next opening
        if (modalContent) {
          modalContent.style.opacity = "1";
          modalContent.style.transform =
            "scale(1) translateY(0px) rotateX(0deg)";
          modalContent.style.transition = "";
        }

        if (modalOverlay) {
          modalOverlay.style.opacity = "1";
          modalOverlay.style.transform = "scale(1)";
          modalOverlay.style.filter = "blur(0px)";
          modalOverlay.style.transition = "";
        }

        // Reset radio buttons and hide switch button
        const radioButtons = document.querySelectorAll(
          'input[name="default-radio"]'
        );
        radioButtons.forEach((radio) => (radio.checked = false));
        hideSwitchButton();
      }, 450);
    });
  }

  // Close modal when clicking outside of it
  if (switchModal) {
    switchModal.addEventListener("click", function (e) {
      if (e.target === switchModal || e.target.classList.contains("fixed")) {
        if (closeSwitchModal) {
          closeSwitchModal.click();
        }
      }
    });
  }

  // Alternative: Add event listener to any element with class 'switch-trigger'
  // This provides flexibility for multiple switch elements
  const switchTriggers = document.querySelectorAll(".switch-trigger");
  switchTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      showModal();
    });
  });
});
