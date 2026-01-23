<template>
  <div class="relative isolate overflow-hidden">
    <div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 animate-fade-in">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-base font-semibold leading-7 text-zinc-400 animate-slide-down">Installation</h2>
        <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl animate-slide-down delay-100">
          Get BetterSEQTA+
        </p>
        <p class="mt-6 text-lg leading-8 text-zinc-300 animate-fade-in delay-200">
          Choose the version that suits you best: Browser Extension or Desktop App.
        </p>
      </div>

      <!-- Comparison Link -->
      <div class="mx-auto max-w-2xl text-center mt-8 animate-fade-in delay-300">
        <p class="text-base leading-7 text-zinc-400">
          Don't know what version to choose? 
          <NuxtLink to="/comparison" class="text-blue-400 transition-colors duration-200 hover:text-blue-300 focus:text-blue-200 underline underline-offset-2">
            Compare editions
          </NuxtLink>
        </p>
      </div>

      <!-- Download Options -->
      <div class="mt-16 sm:mt-24 space-y-24">
        <!-- Browser Extensions -->
        <div>
          <h3 class="text-2xl font-semibold leading-7 text-white mb-8 pl-1">BetterSEQTA+ Extension</h3>
          <div class="mx-auto max-w-2xl lg:max-w-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Chrome Card -->
            <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <svg class="h-7 w-7 flex-none transition-transform duration-300 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
                  <path fill="#fff" d="M34,24c0,5.521-4.479,10-10,10s-10-4.479-10-10s4.479-10,10-10S34,18.479,34,24z"/>
                  <defs>
                    <linearGradient id="chromeGreen" x1="5.789" x2="31.324" y1="34.356" y2="20.779" gradientTransform="matrix(1 0 0 -1 0 50)" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stop-color="#4caf50"/>
                      <stop offset=".489" stop-color="#4aaf50"/>
                      <stop offset=".665" stop-color="#43ad50"/>
                      <stop offset=".79" stop-color="#38aa50"/>
                      <stop offset=".892" stop-color="#27a550"/>
                      <stop offset=".978" stop-color="#11a050"/>
                      <stop offset="1" stop-color="#0a9e50"/>
                    </linearGradient>
                    <linearGradient id="chromeYellow" x1="33.58" x2="33.58" y1="6" y2="34.797" gradientTransform="matrix(1 0 0 -1 0 50)" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stop-color="#ffd747"/>
                      <stop offset=".482" stop-color="#ffd645"/>
                      <stop offset=".655" stop-color="#fed43e"/>
                      <stop offset=".779" stop-color="#fccf33"/>
                      <stop offset=".879" stop-color="#fac922"/>
                      <stop offset=".964" stop-color="#f7c10c"/>
                      <stop offset="1" stop-color="#f5bc00"/>
                    </linearGradient>
                    <linearGradient id="chromeRed" x1="36.128" x2="11.574" y1="44.297" y2="28.954" gradientTransform="matrix(1 0 0 -1 0 50)" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stop-color="#f7572f"/>
                      <stop offset=".523" stop-color="#f7552d"/>
                      <stop offset=".712" stop-color="#f75026"/>
                      <stop offset=".846" stop-color="#f7461b"/>
                      <stop offset=".954" stop-color="#f7390a"/>
                      <stop offset="1" stop-color="#f73100"/>
                    </linearGradient>
                    <linearGradient id="chromeBlue" x1="19.05" x2="28.95" y1="30.95" y2="21.05" gradientTransform="matrix(1 0 0 -1 0 50)" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stop-color="#2aa4f4"/>
                      <stop offset="1" stop-color="#007ad9"/>
                    </linearGradient>
                  </defs>
                  <path fill="url(#chromeGreen)" d="M31.33,29.21l-8.16,14.77C12.51,43.55,4,34.76,4,24C4,12.96,12.96,4,24,4v11 c-4.97,0-9,4.03-9,9s4.03,9,9,9C27.03,33,29.7,31.51,31.33,29.21z"/>
                  <path fill="url(#chromeYellow)" d="M44,24c0,11.05-8.95,20-20,20h-0.84l8.17-14.79C32.38,27.74,33,25.94,33,24 c0-4.97-4.03-9-9-9V4c7.81,0,14.55,4.48,17.85,11C43.21,17.71,44,20.76,44,24z"/>
                  <path fill="url(#chromeRed)" d="M41.84,15H24c-4.97,0-9,4.03-9,9c0,1.49,0.36,2.89,1.01,4.13H16L7.16,13.26H7.14 C10.68,7.69,16.91,4,24,4C31.8,4,38.55,8.48,41.84,15z"/>
                  <path fill="url(#chromeBlue)" d="M31,24c0,3.867-3.133,7-7,7s-7-3.133-7-7s3.133-7,7-7S31,20.133,31,24z"/>
                </svg>
                <span class="ml-2">Chrome</span>
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Install BetterSEQTA+ on Chrome for the best experience.</p>
                <p class="mt-6">
                  <a href="https://chromewebstore.google.com/detail/betterseqta+/afdgaoaclhkhemfkkkonemoapeinchel" class="text-sm font-semibold leading-6 text-zinc-400 transition-colors duration-200 hover:text-zinc-300 focus:text-zinc-200">
                    Add to Chrome <span aria-hidden="true">→</span>
                  </a>
                </p>
              </dd>
            </div>
            <!-- Edge Card -->
            <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-100">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="28px" height="28px"><path fill="#1de9b6" d="M4,23.481C4,15.673,10.557,4,24.014,4C37.452,4,44,13.923,44,20.905c0,5.604-4.429,9.732-9.992,9.732	c-4.245,0-6.759-1.408-6.759-2.53c0-0.726,1.755-1.837,1.755-3.982c0-2.565-1.986-5.137-5.045-5.137	c-2.934,0-4.974,2.442-4.974,4.905c0,5.952,5.63,11.644,13.931,11.644c4.959,0,6.759-1.828,7.403-1.828	c0.196,0,0.647,0.08,0.647,0.603c0,0.5-5.486,9.686-16.94,9.686C12.632,44,4,35.023,4,23.481z"/><radialGradient id="2pm2zgLwrfHW4PMfqfOjYa" cx="17.993" cy="32.825" r="21.348" gradientTransform="matrix(1 0 0 1.1083 0 -3.529)" gradientUnits="userSpaceOnUse"><stop offset=".652" stop-color="#0083de"/><stop offset=".822" stop-color="#006aac"/><stop offset=".944" stop-color="#005a8c"/></radialGradient><path fill="url(#2pm2zgLwrfHW4PMfqfOjYa)" d="M4,23.481c0-7.808,7.615-12.04,12.73-12.04c13.439,0,17.277,2.483,17.277,9.465	c0,5.604-5.003,5.366-5.003,3.221c0-2.565-1.986-5.137-5.045-5.137c-2.934,0-4.974,2.442-4.974,4.905	c0,5.952,5.63,11.644,13.931,11.644c4.959,0,6.759-1.828,7.403-1.828c0.196,0,0.647,0.08,0.647,0.603c0,0.5-5.486,9.686-16.94,9.686	C12.632,44,4,35.023,4,23.481z"/><radialGradient id="2pm2zgLwrfHW4PMfqfOjYb" cx="28.082" cy="29.295" r="16.478" gradientTransform="matrix(1 0 0 1.0028 0 -.067)" gradientUnits="userSpaceOnUse"><stop offset=".69" stop-color="#05509b"/><stop offset=".717" stop-color="#054e98"/><stop offset="1" stop-color="#033e78"/></radialGradient><path fill="url(#2pm2zgLwrfHW4PMfqfOjYb)" d="M18.985,23.894c0-2.298,1.775-4.575,4.395-4.871c-4.104,0.349-8.798,4.375-8.798,11.831	c0,7.963,6.864,13.465,13.943,12.628c8.386-1.927,12.441-8.74,12.441-9.168c0-0.523-0.451-0.603-0.647-0.603	c-0.643,0-2.444,1.828-7.403,1.828C24.615,35.539,18.985,29.847,18.985,23.894z"/><radialGradient id="2pm2zgLwrfHW4PMfqfOjYc" cx="47.648" cy="16.079" r="61.532" gradientTransform="matrix(-1 0 0 -1.5084 95.296 40.31)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5eeb69"/><stop offset=".214" stop-color="#4bc958"/><stop offset=".225" stop-color="#4ac862"/><stop offset=".272" stop-color="#47c68b"/><stop offset=".323" stop-color="#44c4ae"/><stop offset=".376" stop-color="#41c2cb"/><stop offset=".433" stop-color="#3fc1e1"/><stop offset=".495" stop-color="#3ec0f1"/><stop offset=".565" stop-color="#3dbffa"/><stop offset=".664" stop-color="#3dbffd"/></radialGradient><path fill="url(#2pm2zgLwrfHW4PMfqfOjYc)" d="M4,23.481C4,15.673,10.557,4,24.014,4C37.452,4,44,13.923,44,20.905	c0,5.604-4.429,9.732-9.992,9.732c-4.245,0-6.759-1.408-6.759-2.53c0-0.726,1.755-1.837,1.755-3.982	c0-2.565-2.076-10.678-12.628-10.678C13.442,13.448,5.256,14.745,4,23.481z"/></svg>
                <span class="ml-2">Edge</span>
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Install BetterSEQTA+ on Microsoft Edge.</p>
                <p class="mt-6">
                  <a href="https://chromewebstore.google.com/detail/betterseqta+/afdgaoaclhkhemfkkkonemoapeinchel" class="text-sm font-semibold leading-6 text-zinc-400 transition-colors duration-200 hover:text-zinc-300 focus:text-zinc-200">
                    Add to Edge <span aria-hidden="true">→</span>
                  </a>
                </p>
              </dd>
            </div>
            <!-- Firefox Card -->
            <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-200">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <svg width="26px" height="26px" viewBox="0 0 51500 51500" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><radialGradient id="b" cx="87.4%" cy="-12.9%" r="128%" gradientTransform="matrix(.8 0 0 1 .18 .13)"><stop offset=".13" stop-color="#ffbd4f"/><stop offset=".28" stop-color="#ff980e"/><stop offset=".47" stop-color="#ff3750"/><stop offset=".78" stop-color="#eb0878"/><stop offset=".86" stop-color="#e50080"/></radialGradient><radialGradient id="d" cx="49%" cy="40%" r="128%" gradientTransform="matrix(.82 0 0 1 .09 0)"><stop offset=".3" stop-color="#960e18"/><stop offset=".35" stop-color="#b11927" stop-opacity=".74"/><stop offset=".43" stop-color="#db293d" stop-opacity=".34"/><stop offset=".5" stop-color="#f5334b" stop-opacity=".1"/><stop offset=".53" stop-color="#ff3750" stop-opacity="0"/></radialGradient><radialGradient id="e" cx="48%" cy="-12%" r="140%"><stop offset=".13" stop-color="#fff44f"/><stop offset=".53" stop-color="#ff980e"/></radialGradient><radialGradient id="f" cx="22.76%" cy="110.11%" r="100%"><stop offset=".35" stop-color="#3a8ee6"/><stop offset=".67" stop-color="#9059ff"/><stop offset="1" stop-color="#c139e6"/></radialGradient><radialGradient id="h" cx="52%" cy="33%" r="59%" gradientTransform="scale(.9 1)"><stop offset=".21" stop-color="#9059ff" stop-opacity="0"/><stop offset=".97" stop-color="#6e008b" stop-opacity=".6"/></radialGradient><radialGradient id="i" cx="210%" cy="-100%" r="290%"><stop offset=".1" stop-color="#ffe226"/><stop offset=".79" stop-color="#ff7139"/></radialGradient><radialGradient id="j" cx="84%" cy="-41%" r="180%"><stop offset=".11" stop-color="#fff44f"/><stop offset=".46" stop-color="#ff980e"/><stop offset=".72" stop-color="#ff3647"/><stop offset=".9" stop-color="#e31587"/></radialGradient><radialGradient id="k" cx="16.1%" cy="-18.6%" r="348.8%" gradientTransform="matrix(.10453 .46743 -.99452 .04913 -.05 -.26)"><stop offset="0" stop-color="#fff44f"/><stop offset=".3" stop-color="#ff980e"/><stop offset=".57" stop-color="#ff3647"/><stop offset=".74" stop-color="#e31587"/></radialGradient><radialGradient id="l" cx="18.9%" cy="-42.5%" r="238.4%"><stop offset=".14" stop-color="#fff44f"/><stop offset=".48" stop-color="#ff980e"/><stop offset=".66" stop-color="#ff3647"/><stop offset=".9" stop-color="#e31587"/></radialGradient><radialGradient id="m" cx="159.3%" cy="-44.72%" r="313.1%"><stop offset=".09" stop-color="#fff44f"/><stop offset=".63" stop-color="#ff980e"/></radialGradient><linearGradient id="a" x1="87.25%" x2="9.4%" y1="15.5%" y2="93.1%"><stop offset=".05" stop-color="#fff44f"/><stop offset=".37" stop-color="#ff980e"/><stop offset=".53" stop-color="#ff3647"/><stop offset=".7" stop-color="#e31587"/></linearGradient><linearGradient id="n" x1="80%" x2="18%" y1="14%" y2="84%"><stop offset=".17" stop-color="#fff44f" stop-opacity=".8"/><stop offset=".6" stop-color="#fff44f" stop-opacity="0"/></linearGradient><path id="c" d="M47870 16735c-1044-2512-3160-5224-4820-6082 1352 2650 2134 5310 2433 7294 0-6 2 5 4 22l4 26c2268 6147 1032 12398-748 16218-2754 5910-9420 11967-19857 11670-11276-318-21210-8683-23064-19643-338-1728 0-2605 170-4008-207 1080-286 1394-390 3315l-2 123c0 13270 10760 24030 24032 24030 11887 0 21756-8630 23690-19963l110-927c477-4120-53-8453-1560-12075z"/><path id="g" d="M25677 21050c-40 598-2150 2660-2890 2660-6834 0-7943 4133-7943 4133 303 3480 2726 6348 5660 7865 134 70 270 130 405 193a13277 13277 0 00706 289 10674 10674 0 003127 603c11978 562 14300-14320 5655-18640 2213-385 4510 505 5794 1407-2100-3672-6025-6150-10530-6150-285 0-564 24-844 43a12025 12025 0 00-6614 2549c366 310 780 724 1650 1583 1630 1606 5813 3270 5822 3465z"/><path fill="url(#a)" d="M47870 16735c-1044-2512-3160-5224-4820-6082 1352 2650 2134 5310 2433 7294l5 40c-2718-6773-7325-9505-11088-15452l-566-920a7372 7372 0 01-265-497 4370 4370 0 01-359-950 63 63 0 00-55-65 82 82 0 00-45 0l-12 7-17 10 10-14c-6037 3536-8085 10076-8274 13350a12025 12025 0 00-6614 2548 7136 7136 0 00-622-470 11134 11134 0 01-68-5873c-2468 1124-4390 2900-5785 4470h-10c-953-1206-886-5187-832-6018-10-52-710 363-802 425a17507 17507 0 00-2349 2012 21048 21048 0 00-2244 2692l-1 3v-3a20284 20284 0 00-3225 7280l-32 160a39700 39700 0 00-237 1500l-5 52a22907 22907 0 00-390 3316l-1 120c0 13270 10760 24030 24032 24030 11887 0 21756-8630 23690-19963l110-927c477-4120-53-8453-1560-12075zM20170 35545c113 53 220 112 334 164l16 10a12620 12620 0 01-350-174zm5506-14493zm19813-3060l-3-23 4 26z"/><use fill="url(#b)" xlink:href="#c"/><use fill="url(#d)" xlink:href="#c"/><path fill="url(#e)" d="M36192 19560l150 110a13070 13070 0 00-2231-2911C26640 9290 32150 563 33080 120l10-13c-6037 3535-8085 10076-8273 13348 280-20 560-43 844-43 4505 0 8430 2477 10530 6150z"/><use fill="url(#f)" xlink:href="#g"/><use fill="url(#h)" xlink:href="#g"/><path fill="url(#i)" d="M17083 15204a24404 24404 0 01498 330 11134 11134 0 01-67-5874c-2470 1125-4390 2900-5785 4470 115-3 3600-66 5354 1074z"/><path fill="url(#j)" d="M1822 26240c1855 10960 11788 19325 23063 19644 10437 296 17104-5762 19858-11670 1780-3820 3016-10070 748-16218v-2l-4-24c-2-17-4-28-4-22l5 40c853 5566-1980 10958-6405 14604l-13 30c-8625 7023-16878 4237-18550 3097a14410 14410 0 01-350-174c-5028-2403-7105-6984-6660-10913-4245 0-5693-3580-5693-3580s3812-2718 8836-355c4653 2190 9023 355 9023 354-10-195-4192-1860-5822-3465-872-860-1285-1272-1652-1583a7136 7136 0 00-622-470 28293 28293 0 00-498-330c-1753-1140-5240-1076-5355-1073h-10c-953-1207-886-5188-832-6020-10-50-710 363-802 426a17507 17507 0 00-2349 2012 21048 21048 0 00-2244 2692l-1 3v-3a20284 20284 0 00-3225 7280c-10 52-865 3784-444 5720z"/><path fill="url(#k)" d="M34110 16760a13070 13070 0 012231 2910l360 296c5450 5020 2594 12120 2380 12626 4426-3646 7258-9038 6405-14604-2716-6774-7323-9506-11086-15453l-566-920a7372 7372 0 01-265-497 4370 4370 0 01-359-950 63 63 0 00-55-65 82 82 0 00-45 0l-12 7-17 10c-930 443-6440 9170 1030 16640z"/><path fill="url(#l)" d="M36702 19965a4743 4743 0 00-360-295l-150-110c-1283-900-3580-1792-5794-1407 8644 4322 6323 19203-5655 18640a10674 10674 0 01-3127-603 13451 13451 0 01-706-289 9064 9064 0 01-405-193l16 10c1670 1140 9924 3925 18550-3097l13-30c213-506 3068-7606-2380-12626z"/><path fill="url(#m)" d="M14844 27844s1110-4133 7943-4133c740 0 2850-2062 2890-2660s-4370 1836-9023-354c-5024-2363-8836 354-8836 354s1448 3580 5693 3580c-445 3930 1632 8510 6660 10913 113 53 218 112 334 164-2935-1517-5358-4384-5660-7865z"/><path fill="url(#n)" d="M47870 16735c-1044-2512-3160-5224-4820-6082 1352 2650 2134 5310 2433 7294l5 40c-2718-6773-7325-9505-11088-15452l-566-920a7372 7372 0 01-265-497 4370 4370 0 01-359-950 63 63 0 00-55-65 82 82 0 00-45 0l-12 7-17 10 10-14c-6037 3536-8085 10076-8274 13350 280-20 560-43 845-43 4505 0 8430 2477 10530 6148-1284-900-3580-1792-5795-1407 8644 4322 6323 19203-5655 18640a10674 10674 0 01-3127-603 13451 13451 0 01-706-289 9064 9064 0 01-405-193l17 10a14410 14410 0 01-350-174c112 53 218 112 333 164-2935-1517-5358-4384-5660-7865 0 0 1108-4133 7942-4133 740 0 2850-2062 2890-2660-10-195-4190-1860-5822-3465-870-860-1285-1272-1650-1583a7136 7136 0 00-623-470 11134 11134 0 01-67-5873c-2470 1124-4390 2900-5785 4470h-10c-953-1207-886-5187-832-6020-10-50-710 363-802 426a17507 17507 0 00-2349 2012 21048 21048 0 00-2243 2692l-1 3v-3a20284 20284 0 00-3225 7280l-32 160a39787 39787 0 00-277 1515c-2 18 2-17 0 0a27956 27956 0 00-355 3353l-3 122c0 13270 10760 24030 24032 24030 11887 0 21756-8630 23690-19963l110-927c477-4120-53-8453-1560-12075zm-2384 1234l4 26v-2l-4-24z"/></svg>
                <span class="ml-2">Firefox</span>
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Install BetterSEQTA+ on Firefox.</p>
                <p class="mt-6">
                  <a href="https://addons.mozilla.org/en-US/firefox/addon/betterseqta-plus/" class="text-sm font-semibold leading-6 text-zinc-400 transition-colors duration-200 hover:text-zinc-300 focus:text-zinc-200">
                    Add to Firefox <span aria-hidden="true">→</span>
                  </a>
                </p>
              </dd>
            </div>
          </div>
        </div>

        <!-- DesQTA Apps -->
        <div>
          <h3 class="text-2xl font-semibold leading-7 text-white mb-8 pl-1 flex items-center gap-3">
            DesQTA App
            <span v-if="latestVersion" class="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-0 text-xs font-medium text-blue-300 ring-1 ring-inset ring-blue-500/30 leading-7">
              {{ latestVersion }}
            </span>
          </h3>

          <div class="mx-auto max-w-2xl lg:max-w-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Windows -->
            <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="currentColor">
                  <path d="M7,6h15c0.552,0,1,0.448,1,1v15c0,0.552-0.448,1-1,1H7c-0.552,0-1-0.448-1-1V7 C6,6.448,6.448,6,7,6z"></path>
                  <path d="M25.042,21.958V7c0-0.552,0.448-1,1-1H41c0.552,0,1,0.448,1,1v14.958 c0,0.552-0.448,1-1,1H26.042C25.489,22.958,25.042,22.511,25.042,21.958z"></path>
                  <path d="M7,25h15c0.552,0,1,0.448,1,1v15c0,0.552-0.448,1-1,1H7c-0.552,0-1-0.448-1-1V26 C6,25.448,6.448,25,7,25z"></path>
                  <path d="M25,41V26c0-0.552,0.448-1,1-1h15c0.552,0,1,0.448,1,1v15c0,0.552-0.448,1-1,1H26 C25.448,42,25,41.552,25,41z"></path>
                </svg>
                <span class="ml-2">Windows</span>
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Download the latest version for Windows 10 and above.</p>
                <div class="mt-auto pt-6 flex flex-col gap-3">
                  <a :href="exeDownloadUrl" class="inline-flex items-center justify-center rounded-lg bg-blue-500 px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-blue-600 focus:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900">
                    Download EXE
                  </a>
                  <a :href="msiDownloadUrl" class="text-sm font-medium leading-6 text-zinc-400 transition-colors duration-200 hover:text-zinc-300 focus:text-zinc-200">
                    Download MSI <span aria-hidden="true">→</span>
                  </a>
                </div>
              </dd>
            </div>

            <!-- macOS -->
            <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-100">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"></path>
                </svg>
                <span class="ml-2">macOS</span>
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Download the latest version for macOS 10.15 and above.</p>
                <div class="mt-auto pt-6 flex flex-col gap-3">
                  <a :href="dmgDownloadUrl" class="inline-flex items-center justify-center rounded-lg bg-blue-500 px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-blue-600 focus:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900">
                    Download DMG
                  </a>
                  <a class="text-sm font-medium leading-6 text-zinc-400 transition-colors duration-200 hover:text-zinc-300 focus:text-zinc-200">
                    ⠀<span aria-hidden="true"> </span>
                  </a>
                </div>
              </dd>
            </div>

            <!-- Linux -->
            <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-200">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 15 15">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.53918 2.40715C4.82145 1.0075 6.06066 0 7.49996 0C8.93926 0 10.1785 1.0075 10.4607 2.40715L10.798 4.07944C10.9743 4.9539 11.3217 5.78562 11.8205 6.52763L12.4009 7.39103C12.7631 7.92978 12.9999 8.5385 13.0979 9.17323C13.6747 9.22167 14.1803 9.58851 14.398 10.1283L14.8897 11.3474C15.1376 11.962 14.9583 12.665 14.4455 13.0887L12.5614 14.6458C12.0128 15.0992 11.2219 15.1193 10.6506 14.6944L9.89192 14.1301C9.88189 14.1227 9.87197 14.1151 9.86216 14.1074C9.48973 14.2075 9.09793 14.261 8.69355 14.261H6.30637C5.90201 14.261 5.51023 14.2076 5.13782 14.1074C5.12802 14.1151 5.11811 14.1227 5.10808 14.1301L4.34942 14.6944C3.77811 15.1193 2.98725 15.0992 2.43863 14.6458L0.55446 13.0887C0.0417175 12.665 -0.1376 11.962 0.110281 11.3474L0.602025 10.1283C0.819715 9.58854 1.32527 9.2217 1.90198 9.17324C2 8.5385 2.2368 7.92978 2.59897 7.39103L3.17938 6.52763C3.67818 5.78562 4.02557 4.9539 4.20193 4.07944L4.53918 2.40715ZM10.8445 9.47585C10.6345 9.63293 10.4642 9.84382 10.3561 10.0938L9.58799 11.8713C9.20026 12.0979 8.75209 12.2237 8.28465 12.2237H6.7153C6.24789 12.2237 5.79975 12.0979 5.41203 11.8714L4.64386 10.0938C4.53581 9.8438 4.36552 9.6329 4.15546 9.47582C4.18121 9.15355 4.2689 8.83503 4.41853 8.53826L5.67678 6.04259L5.68433 6.05007C6.68715 7.04458 8.31304 7.04458 9.31585 6.05007L9.32324 6.04274L10.5814 8.53825C10.7311 8.83504 10.8187 9.15357 10.8445 9.47585ZM9.04068 4.26906V3.05592H8.01353V3.85713C8.23151 3.90123 8.44506 3.97371 8.64848 4.07458L9.04068 4.26906ZM6.98638 3.85718V3.05592H5.95923V4.26919L6.3517 4.07458C6.55504 3.97375 6.7685 3.90129 6.98638 3.85718ZM2.03255 10.1864C1.82255 10.1864 1.6337 10.3132 1.55571 10.5066L1.06397 11.7257C0.981339 11.9306 1.04111 12.1649 1.21203 12.3062L3.0962 13.8633C3.27907 14.0144 3.54269 14.0211 3.73313 13.8795L4.49179 13.3152C4.6813 13.1743 4.74901 12.923 4.6557 12.7071L3.69976 10.4951C3.61884 10.3078 3.43316 10.1864 3.22771 10.1864H2.03255ZM13.4443 10.5066C13.3663 10.3132 13.1775 10.1864 12.9674 10.1864H11.7723C11.5668 10.1864 11.3812 10.3078 11.3002 10.4951L10.3443 12.7071C10.251 12.923 10.3187 13.1743 10.5082 13.3152L11.2669 13.8795C11.4573 14.0211 11.7209 14.0144 11.9038 13.8633L13.788 12.3062C13.9589 12.1649 14.0187 11.9306 13.936 11.7257L13.4443 10.5066ZM6.81106 4.98568C7.24481 4.7706 7.75537 4.7706 8.18912 4.98568L8.68739 5.23275L8.58955 5.32978C7.98786 5.92649 7.01232 5.92649 6.41063 5.32978L6.31279 5.23275L6.81106 4.98568Z"/>
                </svg>
                <span class="ml-2">Linux</span>
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Download the latest version for Linux distributions.</p>
                <div class="mt-auto pt-6 flex flex-col gap-3 min-h-[60px] justify-center">
                  <a class="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-zinc-500 cursor-not-allowed pointer-events-none">
                    Coming Soon
                  </a>
                  <a class="text-sm font-medium leading-6 text-zinc-400 transition-colors duration-200 hover:text-zinc-300 focus:text-zinc-200">
                    ⠀<span aria-hidden="true"> </span>
                  </a>
                </div>
              </dd>
            </div>

            <!-- Android -->
            <div class="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in delay-200">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <svg class="h-7 w-7 flex-none text-blue-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 15.3414c-.5665 0-.9414-.4749-.9414-1.0414s.3749-1.0414.9414-1.0414.9414.4749.9414 1.0414-.3749 1.0414-.9414 1.0414zm-11.046 0c-.5665 0-.9414-.4749-.9414-1.0414s.3749-1.0414.9414-1.0414.9414.4749.9414 1.0414-.3749 1.0414-.9414 1.0414zm11.405-6.34l1.0515-1.9003c.1628-.2938.0589-.6673-.2349-.8301-.2938-.1628-.6673-.0589-.8301.2349L16.8732 8.4103c-1.2513-.5729-2.7665-.9414-4.3732-.9414s-3.1219.3685-4.3732.9414L7.1005 6.4659c-.1628-.2938-.5363-.3977-.8301-.2349-.2938.1628-.3977.5363-.2349.8301L6.9871 8.9614C5.1108 10.0847 3.9795 11.9498 3.9795 14.041h16.041c0-2.0912-1.1313-3.9563-3.0076-5.0796z"></path>
                </svg>
                <span class="ml-2">Android</span>
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <p class="flex-auto">Download the mobile version for Android devices.</p>
                <div class="mt-auto pt-6 flex flex-col gap-3">
                  <a :href="apkDownloadUrl" class="inline-flex items-center justify-center rounded-lg bg-blue-500 px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-blue-600 focus:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900">
                    Download APK
                  </a>
                  <a class="text-sm font-medium leading-6 text-zinc-400 transition-colors duration-200 hover:text-zinc-300 focus:text-zinc-200">
                    ⠀ <span aria-hidden="true"> </span>
                  </a>
                </div>
              </dd>
            </div>
          </div>
        </div>
      </div>

      <!-- System Requirements -->
      <div class="mx-auto mt-32 max-w-2xl sm:mt-40 lg:mt-48 lg:max-w-none animate-fade-in delay-300">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-zinc-400">System Requirements</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            What you need to run BetterSEQTA+ and DesQTA
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            <!-- Browser Reqs -->
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white">Browser Extension</dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <ul class="list-disc pl-6 space-y-3">
                  <li><strong>Chrome/Edge/Brave:</strong> Latest version recommended</li>
                  <li><strong>Firefox:</strong> Supported</li>
                  <li><strong>Safari:</strong> Experimental</li>
                </ul>
              </dd>
            </div>
            <!-- DesQTA Reqs -->
             <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white">DesQTA (Desktop/Mobile)</dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <ul class="list-disc pl-6 space-y-3">
                  <li><strong>Windows:</strong> Windows 10 or later, 4GB RAM</li>
                  <li><strong>macOS:</strong> macOS 10.15 or later, 4GB RAM</li>
                  <li><strong>Linux:</strong> Ubuntu 18.04+ (or equiv), 4GB RAM</li>
                  <li><strong>Android:</strong> Android 7.0+ (API 24), 2GB RAM</li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Installation Guide -->
      <div class="mx-auto mt-32 max-w-2xl sm:mt-40 lg:mt-48 lg:max-w-none animate-fade-in delay-400">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-zinc-400">Installation Guide</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How to install
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white">Browser Extension</dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <ol class="list-decimal pl-6 space-y-3">
                  <li>Click "Add to [Browser]"</li>
                  <li>Confirm the installation</li>
                  <li>Visit SEQTA Learn</li>
                  <li>Enjoy the enhanced experience!</li>
                </ol>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white">Desktop (DesQTA)</dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <ol class="list-decimal pl-6 space-y-3">
                  <li>Download the installer (.msi/.exe/.dmg)</li>
                  <li>Run the installer or drag to Apps</li>
                  <li>Launch DesQTA</li>
                  <li>Log in to your SEQTA account</li>
                </ol>
              </dd>
            </div>
             <div class="flex flex-col">
              <dt class="text-base font-semibold leading-7 text-white">Android</dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                <ol class="list-decimal pl-6 space-y-3">
                  <li>Download the .apk file</li>
                  <li>Enable "Install from Unknown Sources"</li>
                  <li>Install the APK</li>
                  <li>Launch DesQTA from app drawer</li>
                </ol>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

useHead({
  title: "Download",
});

const latestRelease = ref<any>(null);
const apkDownloadUrl = ref<string>('');
const dmgDownloadUrl = ref<string>('');
const exeDownloadUrl = ref<string>('');
const msiDownloadUrl = ref<string>('');

const latestVersion = computed(() => {
  if (!latestRelease.value?.tag_name) return null;
  // enable this next line to remove 'v' prefix if present (e.g., "v1.0.0" -> "1.0.0"):
  //return latestRelease.value.tag_name.replace(/^v/, '');
  // enable this next line to show the full tag name (e.g., "v1.0.0" -> "v1.0.0"):
  return latestRelease.value.tag_name;
});

onMounted(async () => {
  try {
    const response = await fetch('https://api.github.com/repos/betterseqta/desqta/releases?per_page=1');
    const data = await response.json();
    if (data && data.length > 0) {
      latestRelease.value = data[0];

      // Find assets based on content_type or name
      const assets = latestRelease.value.assets;

      // Set the download URLs based on asset names
      apkDownloadUrl.value = assets.find(asset => asset.name.endsWith('.apk'))?.browser_download_url || '';
      dmgDownloadUrl.value = assets.find(asset => asset.name.endsWith('.dmg'))?.browser_download_url || '';
      exeDownloadUrl.value = assets.find(asset => asset.name.endsWith('.exe'))?.browser_download_url || '';
      msiDownloadUrl.value = assets.find(asset => asset.name.endsWith('.msi'))?.browser_download_url || '';
    }
  } catch (error) {
    console.error('Error fetching latest release:', error);
  }
});
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
}
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-24px); }
  to { opacity: 1; transform: none; }
}
.animate-fade-in {
  animation: fade-in 0.8s cubic-bezier(0.4,0,0.2,1) both;
}
.animate-slide-down {
  animation: slide-down 0.8s cubic-bezier(0.4,0,0.2,1) both;
}
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
</style>
