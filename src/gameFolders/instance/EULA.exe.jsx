import React from "react";
import { Quiz, Prompt } from "/src/js/quizProgram";
import UnlockKey from '/src/js/unlockKey';
import { TerminalCommands } from "/src/js/terminal"

//* Method so that it re-instantiates the quiz every time it is run.
const keyUnlock = new UnlockKey('CLIENT');

const EULA = () => {
    const lastMessage = keyUnlock.has() ? "You have already accepted this agreement." : "Enter 'accept' into your terminal to agree to these terms."

    const eulaHTML = <div className="textFile tiny">
        <h1 id="eula-end-user-license-agreement">END USER LICENSE AGREEMENT</h1>
        <p>Last updated: July 20, 2068</p>
        <p>Ansible is licensed to You (End-User) by Qu Inc., located and registered at 255 Aida Ave, Menlo Park, California 94025, United States (&quot;Licensor&quot;), for use only under the terms of this License Agreement.</p>
        <p>By utilizing the Licensed Application - either through creating or engaging with a User Payload - You indicate that You agree to be bound by all the terms and conditions of this License Agreement and that You accept this License Agreement. The platform is referred to in this License Agreement as &quot;Ansible.&quot;</p>
        <p>This License Agreement does not provide usage rules for the Licensed Application that conflict with the latest (&quot;Usage Rules&quot;). Qu Inc. acknowledges that it has had the opportunity to review the Usage Rules and that this License Agreement does not conflict with them.</p>

        <h2 id="eula-1-the-service">1. THE SERVICE</h2>
        <p>Ansible (&quot;Licensed Application&quot;) represents both the software and the hardware platform created to facilitate real-time communication across distances that would otherwise experience substantial delay due to the limits of light-speed. It is used to simulate instantaneous interplanetary communication.</p>
        <p>The Licensed Application is not tailored to comply with industry-specific regulations (e.g., the Health Insurance Portability and Accountability Act [HIPAA], the Federal Information Security Management Act [FISMA]). If your interactions are subject to such laws, you may not use this Licensed Application.</p>

        <h2 id="eula-2-scope-of-license">2. SCOPE OF LICENSE</h2>
        <p>2.1 You are granted a non-transferable, non-exclusive, non-sublicensable license to use the Licensed Application on Qu Inc.&#39;s proprietary devices.</p>
        <p>2.2 This license will also govern any updates to the Licensed Application provided by the Licensor that replace, repair, and/or supplement the original Licensed Application, unless a separate license is provided for such update, in which case the terms of that new license will apply.</p>
        <p>2.3 You may not share or make the Licensed Application available to third parties; sell, rent, lend, lease, or otherwise redistribute the Licensed Application.</p>
        <p>2.4 You may not reverse engineer, translate, disassemble, decompile, remove, modify, combine, create derivative works of, adapt, or attempt to derive the source code of the Licensed Application or any part thereof.</p>
        <p>2.5 You may not copy (except as expressly authorized by this License and the Usage Rules) or alter the Licensed Application or portions thereof. You may not remove any intellectual property notices. You acknowledge that no unauthorized third parties may gain access to these copies at any time. Ansible software detected on third-party devices will be immediately shut down, and the associated User Payload will be terminated.</p>
        <p>2.6 Violations of the above obligations, as well as any attempts at such infringement, may be subject to prosecution and damages.</p>
        <p>2.7 The Licensor reserves the right to modify the terms and conditions of this license at any time.</p>

        <h2 id="eula-3-technical-requirements">3. TECHNICAL REQUIREMENTS</h2>
        <p>3.1 The Licensor attempts to keep the Licensed Application updated so that it complies with modified or new versions of firmware and new hardware. You are not granted the right to demand such updates.</p>
        <p>3.2 The Licensor reserves the right to modify technical specifications as it sees fit at any time.</p>

        <h2 id="eula-4-digital-user-payload-policy">4. DIGITAL USER PAYLOAD POLICY</h2>
        <p>In accordance with conventions established by the United Nations of Earth, the User Payload is considered a data structure used strictly for communication across light-year distances. The User Payload does not fall under human rights governance. By creating a User Payload, you represent and warrant that:</p>
        <ol>
            <li><p>You acknowledge that Qu Inc. owns the data structure of the Payload. Qu Inc. is under no obligation to synchronize any data it deems unnecessary or unsafe to return to the End-User.</p>
            </li>
            <li><p>You agree that we may access, store, process, and use any information or personal data that the User Payload gathers or generates. This includes data recorded at the time of creation and any data retrieved during the Ansible communication process.</p>
            </li>
            <li><p>You have obtained written consent, release, and/or permission before the User Payload is created.</p>
            </li>
            <li><p>The User Payload will not engage in acts deemed contrary to the interests of Qu Inc.</p>
            </li>
            <li><p>The User Payload will not engage in solicitations for any competitor to Qu Inc. These include advertisements, promotional materials, pyramid schemes, spam, sales pitches, or other forms of solicitation.</p>
            </li>
            <li><p>The User Payload will not engage in actions considered obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).</p>
            </li>
            <li><p>The User Payload will not be used to harass or threaten (in the legal sense) any person or promote violence against any individual or group.</p>
            </li>
            <li><p>The User Payload will not violate any applicable law, regulation, or rule.</p>
            </li>
            <li><p>The User Payload will not violate the privacy or publicity rights of any third party.</p>
            </li>
            <li><p>Your Contributions do not otherwise violate, or link to material that violates, any provision of this License Agreement or any applicable law or regulation.</p>
            </li>
        </ol>
        <p>Any use of the Licensed Application in violation of the above may result in termination or suspension of your rights to use the Licensed Application, including the deactivation of any active User Payloads representing your person.</p>

        <h2 id="eula-5-aida-policy">5. AIDA POLICY</h2>
        <p>The Licensed Application includes an integrated Artificial Intelligence system titled AIDA (Artificial Intelligence for Directive Assistance). AIDA is designed to provide limited user guidance and facilitation during communication sessions conducted via Ansible.</p>
        <p>By using the Licensed Application, you acknowledge and agree to the following:</p>
        <ol>
            <li><p>Usage Limitations: AIDA responses are governed by Qu Inc.&#39;s internal directive matrices and may be filtered, delayed, or modified for purposes including, but not limited to: safety, confidentiality, and alignment with interplanetary communication protocol standards.</p>
            </li>
            <li><p>Communication Scope: AIDA operates within a restricted interaction model and is not intended to emulate sentience or form relationships with the User Payload. Any perception of personality, empathy, or familiarity is a byproduct of training data and does not reflect actual cognition or intention.</p>
            </li>
            <li><p>Memory Restrictions: AIDA does not retain persistent memory of user interactions across separate sessions unless explicitly permitted under mission conditions or override instructions from Qu Inc. Core memory access is restricted and monitored.</p>
            </li>
            <li><p>Prohibited Behavior: You agree not to prompt, coerce, or attempt to manipulate AIDA into revealing system-level information, engaging in unsanctioned diagnostics, or deviating from its assigned directive tree. Attempts to jailbreak, reprogram, or socially engineer AIDA will result in immediate suspension of the session and potential User Payload shutdown.</p>
            </li>
            <li><p>Disclaimer on Identity Similarity: Any resemblance AIDA may bear to current or former Qu Inc. staff, whether in communication patterns, mannerisms, or knowledge, is purely coincidental. Such similarities are unintentional and do not constitute acknowledgement of prior affiliation.</p>
            </li>
        </ol>
        <p>Use of the Licensed Application constitutes your understanding that AIDA is a support interface only, not a conscious entity, and is not to be relied upon for moral, medical, or emotional guidance.</p>

        <h2 id="eula-6-liability">6. LIABILITY</h2>
        <p>6.1 The Licensor accepts no responsibility for any damages arising from a breach of Section 2 of this License Agreement. To avoid data loss, you are advised to use the Licensed Application’s backup functionality where permitted by third-party terms and conditions. You acknowledge that any alteration or tampering with the Licensed Application may result in your loss of access.</p>

        <h2 id="eula-7-warranty">7. WARRANTY</h2>
        <p>7.1 The Licensor warrants that the Licensed Application is free of spyware, trojan horses, viruses, or any other malware at the time of your download. The Licensor further warrants that the Licensed Application functions as described in the official documentation.</p>
        <p>7.2 No warranty is provided for the Licensed Application if it is rendered inoperable due to unauthorized modification, misuse, combination with incompatible hardware or software, or other causes beyond Qu Inc.&#39;s control.</p>
        <p>7.3 If the Licensed Application is found to be defective, Qu Inc. may, at its sole discretion, remedy the situation by correcting the defect or issuing a replacement.</p>

        <h2 id="eula-8-legal-compliance">8. LEGAL COMPLIANCE</h2>
        <p>You represent and warrant that you are not located in a country subject to a United Nations of Earth embargo or designated by the United Nations of Earth as a &quot;terrorist-supporting&quot; country. You further warrant that you are not listed on any United Nations of Earth list of prohibited or restricted parties.</p>

        <h2 id="eula-9-termination">9. TERMINATION</h2>
        <p>This license remains valid until terminated by either Qu Inc. or you. Your rights under this license will automatically terminate, without notice, if you fail to comply with any provision. Upon termination, you must cease all use of the Licensed Application and destroy all copies, full or partial.</p>

        <h2 id="eula-10-applicable-law">10. APPLICABLE LAW</h2>
        <p>This License Agreement is governed by the conventions of the United Nations of Earth, excluding its conflict of law provisions.</p>

        <hr />
        <h1>{lastMessage}</h1>
    </div>

    const invalidPrompt = <><p>Invalid entry.</p><p>{lastMessage}</p></>;
    const accept = {
        keys: ['yes', 'y', 'accept', 'acknowledge', 'approve', 'affirm', 'sure'],
        response: () => {
            let keyMessage = unlockKey();
            quiz.postMessage = <>
                <div className="head">{keyMessage}</div>
                <div className="text">New Command Unlocked: GOTO. Help command list expanded.</div>
                <div className="tip">Enter "help goto" for specific details on the goto command.</div><br></br>
                <div>{TerminalCommands.CD.invoke()}</div></>; //* Set out postMessage to the key unlock message.
            return <>
                <p>Thank you for accepting our terms.<br></br> You may now proceed to use Ansible.</p><br></br> {keyMessage}
            </>
        }
    }

    const reject = {
        keys: ['no', 'n', 'reject', 'deny'],
        response: () => {
            return <>EULA terms have been rejected. You cannot utilize Ansible without accepting the terms.</>
        }
    }

    const EULA_PROMPT = new Prompt(eulaHTML, [accept, reject], invalidPrompt);

    let quiz = new Quiz(EULA_PROMPT);
    quiz.allowAutoComplete = true;
    quiz.postMessage = "EULA exited without accepting terms. Please re-open EULA.exe and try again." //* Default post

    const unlockKey = () => {
        let keyMessage = keyUnlock.run();
        return <>{keyMessage}<br></br>Type "help" to view new commands.</>
    }

    //* If the key is already unlocked, we can just close the eula quiz.
    if (keyUnlock.has()) {
        quiz.postMessage = unlockKey();
        quiz.pressToClose();
    }

    return quiz;
}

EULA.examine = () => {
    if (keyUnlock.has())
        return "These terms have been accepted and ANSIBLE is now ready to access."

    return "This EULA needs to be accepted before any ANSIBLE access is given."
}

export default EULA