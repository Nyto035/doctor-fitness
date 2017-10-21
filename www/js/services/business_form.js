angular.module('app.services.businessInputs', [])

.service('app.services.workoutProfile', workoutProfile)

.service('app.services.businessInputs.form', businessInputs);
    
    function workoutProfile() {
        var self = this;
        var leg_glute = ' Lie on your back with your knees bent and '+
            'soles of your feet on the floor. Extend one leg. On your' +
            ' exhale, squeeze your glutes, and push your hips up toward'+
            ' the ceiling as high as you can. Pause, then lower until'+
            ' your butt hovers right above the floor, and repeat'+
            ' without touching the ground to complete one rep.';

        var hydrants = 'Begin on all fours with your knees hips-width'+
            ' apart and your wrists stacked over your shoulders.'+
            ' Keeping the knee bent to a 90-degree angle, lift the'+
            ' right leg out to hip-height, then extend the raised leg'+
            ' straight out to the side. Pause before you bend the knee'+
            ' again and bring your leg back to starting position to '+
            'complete one rep.';
        var rainbows = ' Begin on all fours with your knees hips-width'+
            ' apart and your wrists stacked over your shoulders. With a'+
            ' pointed toe, extend your right leg and reach the foot '+
            'toward the ceiling. Slowly lower your leg to tap the floor.'+
            ' Squeeze your glutes as you lift the leg back to starting'+
            ' position, then lower the leg to tap the floor about a'+
            ' foot to the left of your kneeling foot. Return to'+
            ' starting position to complete the rep.';
        var curtsy = ' Stand with your feet hips-width apart and'+
            ' your hands pressed together at chest level. Keeping your'+
            ' hips square, step your left leg diagonally behind you and'+
            ' bend both knees at a 90-degree angle, keeping the knees'+
            ' behind the toes. Pause, then press into your right heel to'+
            ' return to standing position as you extend your left leg '+
            'into a side kick. That\'s one rep.';
        var heel_lifted = ' Begin with your feet slightly wider than'+
            ' shoulders-width apart, toes pointed outward. Lift your '+
            'left heel. With control, sit your hips back as you lower'+
            ' your butt toward the floor, keeping your knees behind '+
            'your toes and bracing your core to help you balance. '+
            'Pause, then press into your right heel to stand up into'+
            ' the starting position to complete one rep.';
        var bear_plunk = 'Begin in a plank position with your shoulders'+
            ' stacked above your wrists, and your body in a straight'+
            ' line between the top of your head and your heels. Lift'+
            ' your right leg and bend the knee 90 degrees, bringing '+
            'your heel toward your butt. With a flexed foot, squeeze'+
            ' your glutes, and raise your right heel up toward the '+
            'ceiling as high as you can. Pause, then bring your right'+
            ' knee back to meet your left knee to complete one rep.';
        var deadlift = 'Stand on your right foot with your left leg '+
            'bent in front of you, knee at hip-height. Engage your glutes'+
            ' as you slowly fold forward, reaching both hands toward the'+
            ' ground as you extend the left leg straight out behind you.'+
            ' Pause, then return to starting position with control to'+
            ' complete one rep.';
        var sumo_squat = 'Begin with your feet wider than shoulder-width'+
            ' apart, toes pointed slightly outward. Keeping your knees'+
            ' above your ankles and chest high, bend your knees until '+
            'your thighs are parallel to the ground. With control, raise'+
            ' one heel as high as you can without compromising your form.'+
            ' Release it to the floor, then repeat on the opposite side '+
            'to complete one rep. Continue to alternate sides.';
        var squat_sumo = ' Begin with your feet wider than shoulders-width'+
            ' apart, toes pointing forward. Keeping your knees behind your'+
            ' toes, sit your hips back into a squat. Pulse up a few inches'+
            ' as your turn your toes 45 degrees outward and sink your hips'+
            ' back into your low squat. Pulse up to bring your toes '+
            'forward and continue to alternate foot positioning as you pulse.';
        var long_desc = leg_glute;
        self.exerciseDetails = function basicFiels() {
            return [
                {
                    'label': 'Single-Leg Glute Bridge',
                    'key': 'name',
                    'duration': '00:30',
                    'img_url': 'single-leg-hipthrust.gif',
                    'long_description': leg_glute,
                },
                {
                    'label': 'Hydrants With Leg Extensions',
                    'key': 'agent',
                    'duration': '00:30',
                    'img_url': 'hydrants-w-leg-extension.gif',
                    'long_description': hydrants,
                },
                {
                    'label': 'Rainbows',
                    'key': 'pin',
                    'duration': '00:30',
                    'img_url': 'rainbows.gif',
                    'long_description': rainbows,
                },
                {
                    'label': 'Curtsy Lunges',
                    'key': 'currency_name',
                    'duration': '00:30',
                    'img_url': 'curtsy-lunge-to-kick.gif',
                    'long_description': curtsy,
                },
                {
                    'label': 'Heel-Lifted Sumo Squat',
                    'key': 'slogan',
                    'duration': '00:30',
                    'img_url': 'squat-w-raised-hee.gif',
                    'long_description': heel_lifted,
                },
                {
                    'label': 'Bear Plank Leg Lifts',
                    'key': 'receipt_footnote',
                    'duration': '00:30',
                    'img_url': 'bear-plank-leg-lifts.gif',
                    'long_description': bear_plunk,
                },
                {
                    'label': 'Single-Leg Dead Lift',
                    'key': 'invoice_footnote',
                    'duration': '00:30',
                    'img_url': 'single-leg-deadlifts.gif',
                    'long_description': deadlift,
                },
                {
                    'label': 'Sumo Squats to Calf Raise',
                    'key': 'quotation_footnote',
                    'duration': '00:30',
                    'img_url': 'squat-alt-heel-lift.gif',
                    'long_description': sumo_squat,
                },
                {
                    'label': 'Squat to Sumo',
                    'key': 'quotation_footnote',
                    'duration': '00:30',
                    'img_url': 'sumo-to-straight-squat.gif',
                    'long_description': squat_sumo,
                },
            ];
        };
        self.mealsDetails = function mealsFxn() {
            var breakFast = [
                'Natural passion juice 200ml',
                'Oats/Bran 200gms',
                'One egg or 50gms chicken gizzard',
            ];
            var lunch = [
                'Whole banana or a fresh apple',
                'Spinach or lettuce or cucumber',
                'One cup milk 200ml',
            ];
            var dinner = [
                'Natural Orange Juice 200ml/beef soup',
                'Cereals/Wholegrain bread 200gms',
                'White meal fish 200gm',
            ];
            return [
                { 
                    'key': 'Monday',
                    'value': [breakFast, lunch, dinner]
                },
                {
                    'key': 'Tuesday', 
                    'value': [breakFast, lunch, dinner]
                },
                {
                    'key': 'Wednesday',
                    'value': [breakFast, lunch, dinner]
                },
                { 
                    'key': 'Thursday',
                    'value': [breakFast, lunch, dinner]
                },
                {
                    'key': 'Friday',
                    'value': [breakFast, lunch, dinner]
                },
                {
                    'key': 'Saturday',
                    'value': [breakFast, lunch, dinner]
                },
                {
                    'key': 'Sunday',
                    'value': [breakFast, lunch, dinner]
                },
            ];
        };
    };

    businessInputs.$inject = [];
    function businessInputs() {
        const self = this;

        self.createSale = function saleFrm() {
            return [
                {
                    'name': 'client_id',
                    'type': 'select',
                    'verbous_name': 'Customer',
                },
            ];
        };

        self.createPurchase = function saleFrm() {
            return [
                {
                    'name': 'supplier_id',
                    'type': 'select',
                    'verbous_name': 'Supplier',
                },
            ];
        };
    };
