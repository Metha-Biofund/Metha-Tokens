# Metha-Biofund
Metha biofund project repository.

<strong>I. Disclaimer</strong>

  This repository is for transparency purpose of the code used for the metha biofund token sale.
  
Furder code developement during the projects run by metha biofund may also be uplaoded to this repository.

<strong>II. Crowdsale and token features.</strong>

  Metha biofiund token crowdsale is designed to last as long as the utopic objective of metha biofund is achieved, which might
end up being a very long time period. A set amount of tokens will be sold at every period
of 23 hours indepently of the ether contributed during that period. Which means all the tokens of any given period will be distributed 
among the contributors of that period independently of the total ether contributed.

  The daily total of tokens sold will be fixed to a certain amount chosen so in the long run the volume of the "minted" tokens every period will remain negligible before the daily token transactions.

  All code in this repository will be audited and inspected carefully to ensure the security and correct functioning of the contract
however given the fact that the token and token sale will be lasting for a long period of time, vulnerabilities in the ethereum network
and in the code of the token sale itself may be exposed. To fight this, the token has a security feature which in the eventuality of a 
high risk vulnerability will freeze token transfers. Tokens will then be replaced by a revised version without said vulnerability, and 
distributed to holder adresses before the vulnerability arised. If you find any kind of vulnerability in the code of this repository
please get in touch with us at metha@metha.life to claim your bounty for helping us improve and secure the project.

<strong>III. How to use.</strong>

  To contribute to the crowdsale just send the ether you want to contribute to the token contract, after the period in which you
contributed ends, you can claim your tokens at any time wether by calling the claimDay function to claim the tokens of a specific
day, or the claimAll to claim all periods at once. Bear in mind that the claimAll function is gas expensive, and it may be better
if you contributed in a few days to just call every day indiviadually or use the claimPeriod function to claim for all the periods 
in a range.

  You can also use the buyWithLimit function to set a maximum ether price per token for your contribution to be submited, and also to set contribution orders for future periods.
  
<strong>IV Contributor support and troubleshooting.</strong>
  
  If you have trouble using the crowdsale, the tokens, or have any kind of suggestion or inquiry related to metha biofund please get in 
touch with us at support@metha.life. We will do our best to help you.

Copyright (c) 2018 Metha Biofund
